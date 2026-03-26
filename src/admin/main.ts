import type { ProjectConfig } from '../scripts/types';

// Vite Globals
declare const __APP_VERSION__: string;
declare const __BUILD_ID__: string;

// State
let projects: any[] = [];
let currentProject: ProjectConfig | null = null;
let currentToken = localStorage.getItem('COS_ADMIN_TOKEN') || '';
let isCreatingNew = false;

// Elements
const sidebarProjects = document.getElementById('sidebarProjects')!;
const appMain = document.getElementById('appMain')!;
const loginGate = document.getElementById('loginGate')!;
const appHeader = document.getElementById('appHeader')!;
const appSidebar = document.getElementById('appSidebar')!;

// Custom Dropdown Elements
const selectTrigger = document.getElementById('selectTrigger')!;
const selectOptions = document.getElementById('selectOptions')!;
const headerNewBtn = document.getElementById('headerNewBtn')!;

const configForm = document.getElementById('configForm') as HTMLFormElement;
const systemStatusValue = document.getElementById('systemStatusValue')!;
const toastContainer = document.getElementById('toastContainer')!;
const deleteProjectBtn = document.getElementById('deleteProjectBtn')!;
const promoteBtn = document.getElementById('promoteBtn') as HTMLButtonElement;

// Precision Pulse Elements
const pulsePrimaryInfra = document.getElementById('pulsePrimaryInfra')!;
const pulsePrimaryScript = document.getElementById('pulsePrimaryScript')!;
const pulseBackupInfra = document.getElementById('pulseBackupInfra')!;
const pulseBackupScript = document.getElementById('pulseBackupScript')!;

// --- Auth ---
function showLogin() {
    loginGate.classList.remove('hidden');
    appHeader.classList.add('hidden');
    appSidebar.classList.add('hidden');
    appMain.classList.add('hidden');
}

function showApp() {
    loginGate.classList.add('hidden');
    appHeader.classList.remove('hidden');
    appSidebar.classList.remove('hidden');
    appMain.classList.remove('hidden');
    loadProjects();
}

function authCheck() {
    if (currentToken) {
        showApp();
    } else {
        showLogin();
    }
}

document.getElementById('loginBtn')?.addEventListener('click', () => {
    const val = (document.getElementById('loginToken') as HTMLInputElement).value;
    if (val) {
        currentToken = val;
        localStorage.setItem('COS_ADMIN_TOKEN', val);
        authCheck();
        showToast('Authorized');
    }
});

document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('COS_ADMIN_TOKEN');
    location.reload();
});

// --- Custom Selector Logic ---
selectTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    selectOptions.classList.toggle('show');
});

document.addEventListener('click', () => {
    selectOptions.classList.remove('show');
});

headerNewBtn.addEventListener('click', () => {
    prepareNewProject();
});

function prepareNewProject() {
    isCreatingNew = true;
    currentProject = null;
    configForm.reset();
    (document.getElementById('projectId') as HTMLInputElement).value = '';
    (document.getElementById('projectName') as HTMLInputElement).value = '';
    (document.getElementById('saveBtn') as HTMLButtonElement).textContent = 'Create & Deploy Project';
    deleteProjectBtn.classList.add('hidden');
    selectTrigger.textContent = 'Creating New Project...';
    switchTab('config');
    showToast('Ready for new project');
}

// --- Project Management ---
async function loadProjects() {
    try {
        const res = await fetch('/api/projects', {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        if (res.status === 401) return showLogin();
        projects = await res.json();
        renderSelectors();
        if (projects.length > 0 && !currentProject && !isCreatingNew) {
            switchProject(projects[0].id);
        }
    } catch (e) {
        showToast('Failed to load projects', 'error');
    }
}

function renderSelectors() {
    sidebarProjects.innerHTML = projects.map(p => `
        <div class="project-item ${currentProject?.id === p.id ? 'active' : ''}" data-id="${p.id}">
            ${p.name}
        </div>
    `).join('');
    
    document.querySelectorAll('.project-item[data-id]').forEach(item => {
        item.addEventListener('click', () => switchProject((item as HTMLElement).dataset.id!));
    });

    const projectOptions = projects.map(p => `
        <li class="option-item ${currentProject?.id === p.id ? 'active' : ''}" data-id="${p.id}">
            ${p.name}
        </li>
    `).join('');
    
    selectOptions.innerHTML = `<li class="option-item new-btn" id="headerNewBtn">+ Create New Project</li>` + projectOptions;
    document.getElementById('headerNewBtn')?.addEventListener('click', prepareNewProject);

    document.querySelectorAll('.option-item[data-id]').forEach(opt => {
        opt.addEventListener('click', () => switchProject((opt as HTMLElement).dataset.id!));
    });

    if (!isCreatingNew) {
        selectTrigger.textContent = currentProject?.name || 'Select a Project';
    }
}

async function switchProject(id: string) {
    isCreatingNew = false;
    try {
        const res = await fetch(`/api/config?project=${id}`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        currentProject = await res.json();
        renderSelectors();
        renderProjectConfig();
        startHealthCheck();
        updateSnippets();
        deleteProjectBtn.classList.remove('hidden');
        (document.getElementById('saveBtn') as HTMLButtonElement).textContent = 'Generate New Version & Deploy';
        showToast(`Switched to ${currentProject?.name}`);
    } catch (e) {
        showToast('Failed to load project config', 'error');
    }
}

function renderProjectConfig() {
    if (!currentProject) return;
    (document.getElementById('projectName') as HTMLInputElement).value = currentProject.name || '';
    (document.getElementById('gaId') as HTMLInputElement).value = currentProject.gaId || '';
    (document.getElementById('pixelId') as HTMLInputElement).value = currentProject.pixelId || '';
    (document.getElementById('fbVerifyId') as HTMLInputElement).value = (currentProject as any).fbVerifyId || '';
    (document.getElementById('siteDomain') as HTMLInputElement).value = currentProject.siteDomain || '';
    (document.getElementById('scriptDomain') as HTMLInputElement).value = currentProject.scriptDomain || '';
    (document.getElementById('backupDomain') as HTMLInputElement).value = currentProject.backupDomain || '';
    (document.getElementById('backupWebhook') as HTMLInputElement).value = currentProject.backupWebhook || '';
    (document.getElementById('backupDeployKey') as HTMLInputElement).value = currentProject.backupDeployKey || '';
    (document.getElementById('preset') as HTMLSelectElement).value = currentProject.preset || 'kartra_standard';
    (document.getElementById('projectId') as HTMLInputElement).value = currentProject.id;
    (document.getElementById('ttlDays') as HTMLInputElement).value = (currentProject.ttlDays || 7).toString();
    
    const versionsEl = document.getElementById('versionList')!;
    versionsEl.innerHTML = currentProject.versions?.map((v: any) => `
        <div class="version-item ${currentProject?.activeVersion === v.id ? 'active' : ''}">
            <span>${v.id} - ${new Date(v.timestamp).toLocaleString()}</span>
            <button class="rollback-btn" data-id="${v.id}">Rollback</button>
        </div>
    `).join('') || 'No versions generated yet.';
}

// --- Monitoring ---
async function startHealthCheck() {
    if (!currentProject) return;
    const { id, activeVersion, scriptDomain, backupDomain } = currentProject;
    const ver = activeVersion || 'latest';

    const check = async (domain: string, type: 'infra' | 'script') => {
        if (!domain) return { ok: false, msg: '--' };
        // V2.8: Infra uses official /api/health with CORS
        const path = type === 'infra' ? '/api/health' : `/api/scripts/${id}/${ver}/header.js`;
        const target = `https://${domain}${path}`;
        
        try {
            // V2.9: Server-to-Server proxy to bypass CORS
            const res = await fetch(`/api/status?target=${encodeURIComponent(target)}`, {
                headers: { 'Authorization': `Bearer ${currentToken}` }
            });
            const data = await res.json();
            
            if (data.ok) {
                return { ok: true, msg: `✓ (${data.latency}ms)` };
            } else {
                return { ok: false, msg: `✗ ${data.status}` };
            }
        } catch (e) {
            return { ok: false, msg: '✗ Offline' };
        }
    };

    const updateUI = (el: HTMLElement, res: { ok: boolean, msg: string }) => {
        el.textContent = res.msg;
        el.style.color = res.ok ? 'var(--success)' : 'var(--error)';
        return res.ok;
    };

    const [pInf, pScr, bInf, bScr] = await Promise.all([
        check(scriptDomain, 'infra'),
        check(scriptDomain, 'script'),
        check(backupDomain, 'infra'),
        check(backupDomain, 'script')
    ]);

    updateUI(pulsePrimaryInfra, pInf);
    updateUI(pulsePrimaryScript, pScr);
    updateUI(pulseBackupInfra, bInf);
    updateUI(pulseBackupScript, bScr);

    const anyOk = pScr.ok || bScr.ok;
    const bothOk = pScr.ok && bScr.ok;

    if (bothOk) systemStatusValue.innerHTML = '<span style="color:var(--success)">Healthy</span>';
    else if (anyOk) systemStatusValue.innerHTML = '<span style="color:var(--warning)">Degraded</span>';
    else systemStatusValue.innerHTML = '<span style="color:var(--error)">Critical</span>';
}

// --- Sync & Promote (V3.0) ---
promoteBtn.addEventListener('click', async () => {
    if (!currentProject) return;
    promoteBtn.disabled = true;
    promoteBtn.textContent = 'Promoting...';
    
    try {
        const res = await fetch(`/api/promote?project=${currentProject.id}`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        
        const contentType = res.headers.get('content-type');
        let data;
        if (contentType && contentType.includes('application/json')) {
            data = await res.json();
        } else {
            const raw = await res.text();
            data = { success: false, error: 'Raw Response', details: raw };
            alert('Cloudflare Server Error (500):\n\n' + raw.slice(0, 1000));
        }

        console.log('[Promote Debug]', data);
        
        if (data.success) {
            showToast('Promoted to Backup Successfully');
        } else {
            showToast(`Promotion failed (Status ${res.status})`, 'error');
            console.error('Promotion Error Details:', data);
        }
    } catch (e) {
        showToast('Network error during promotion', 'error');
        console.error('Promote Network Error:', e);
    } finally {
        promoteBtn.disabled = false;
        promoteBtn.textContent = '🚀 Promote to Backup';
        startHealthCheck();
    }
});

// --- Utils ---
function showToast(msg: string, type: 'success' | 'error' = 'success') {
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = msg;
    toastContainer.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

// Loader Generator (V2.5)
function generateLoader(primaryUrl: string, backupUrl: string) {
    return `(function() {
  if (window.__NILUFER_TRACKER_LOADED__) return;
  window.__NILUFER_TRACKER_LOADED__ = true;
  var SOURCES = ['${primaryUrl}', '${backupUrl}'];
  var loaded = false;
  var index = 0;
  var TIMEOUT = 2500;
  function loadNext() {
    if (loaded || index >= SOURCES.length) return;
    var src = SOURCES[index++];
    var s = document.createElement('script');
    var tId = setTimeout(function() { if(!loaded) { console.warn('Timeout:', src); loadNext(); } }, TIMEOUT);
    s.src = src;
    s.async = true;
    s.onload = function() { loaded = true; clearTimeout(tId); console.log('Tracker loaded:', src); };
    s.onerror = function() { clearTimeout(tId); console.warn('Failed:', src); loadNext(); };
    document.head.appendChild(s);
  }
  loadNext();
})();`;
}

function updateSnippets() {
    if (!currentProject) return;
    const ver = currentProject.activeVersion || 'latest';
    const primaryBase = `https://${currentProject.scriptDomain || 'scripts.domain.com'}/api/scripts/${currentProject.id}/${ver}`;
    const backupBase = `https://${currentProject.backupDomain || 'backup.domain.com'}/api/scripts/${currentProject.id}/${ver}`;
    
    (document.getElementById('snippetHeader') as HTMLElement).textContent = generateLoader(`${primaryBase}/header.js`, `${backupBase}/header.js`);
    (document.getElementById('snippetCheckout') as HTMLElement).textContent = generateLoader(`${primaryBase}/checkout.js`, `${backupBase}/checkout.js`);
    (document.getElementById('snippetThankyou') as HTMLElement).textContent = generateLoader(`${primaryBase}/thankyou.js`, `${backupBase}/thankyou.js`);
}

configForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = (document.getElementById('projectName') as HTMLInputElement).value;
    let id = (document.getElementById('projectId') as HTMLInputElement).value;
    
    if (isCreatingNew) {
        id = name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
        try {
            await fetch('/api/projects', {
                method: 'POST',
                body: JSON.stringify({ id, name }),
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` }
            });
        } catch (err) {
            return showToast('Failed to create project metadata', 'error');
        }
    }

    const data: Partial<ProjectConfig> = {
        id, name,
        gaId: (document.getElementById('gaId') as HTMLInputElement).value,
        pixelId: (document.getElementById('pixelId') as HTMLInputElement).value,
        fbVerifyId: (document.getElementById('fbVerifyId') as HTMLInputElement).value,
        siteDomain: (document.getElementById('siteDomain') as HTMLInputElement).value,
        scriptDomain: (document.getElementById('scriptDomain') as HTMLInputElement).value,
        backupDomain: (document.getElementById('backupDomain') as HTMLInputElement).value,
        backupWebhook: (document.getElementById('backupWebhook') as HTMLInputElement).value,
        backupDeployKey: (document.getElementById('backupDeployKey') as HTMLInputElement).value,
        preset: (document.getElementById('preset') as HTMLSelectElement).value as any,
        ttlDays: parseInt((document.getElementById('ttlDays') as HTMLInputElement).value) || 7,
    };

    try {
        await fetch(`/api/config?project=${id}`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` }
        });
        showToast(isCreatingNew ? 'Project Created & Deployed' : 'Version Generated');
        isCreatingNew = false;
        await loadProjects();
        switchProject(id);
    } catch (e) {
        showToast('Save failed', 'error');
    }
});

deleteProjectBtn.addEventListener('click', async () => {
    if (!currentProject) return;
    if (!confirm(`Are you sure you want to delete "${currentProject.name}"?`)) return;
    try {
        await fetch(`/api/projects?id=${currentProject.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        showToast('Project Deleted');
        currentProject = null;
        await loadProjects();
        switchTab('dashboard');
    } catch (e) {
        showToast('Delete failed', 'error');
    }
});

function switchTab(target: string) {
    document.querySelectorAll('.tab-btn').forEach(b => {
        if ((b as HTMLElement).dataset.tab === target) b.classList.add('active');
        else b.classList.remove('active');
    });
    document.querySelectorAll('main > .container > section').forEach(s => s.classList.add('hidden'));
    document.getElementById(`tab-${target}`)?.classList.remove('hidden');
}

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = (btn as HTMLElement).dataset.tab;
        if (target) switchTab(target);
    });
});

document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = (btn as HTMLElement).dataset.target!;
        const code = document.getElementById(targetId)!.textContent!;
        navigator.clipboard.writeText(code);
        showToast('Snippet copied to clipboard');
    });
});

function injectVersion() {
    const versionStr = `${__APP_VERSION__} | ${__BUILD_ID__}`;
    document.title = `Signal-Path | ${versionStr}`;
    const side = document.getElementById('sideVersion');
    if (side) side.textContent = versionStr;
    const top = document.getElementById('topVersion');
    if (top) top.textContent = versionStr;
}

injectVersion();
authCheck();
setInterval(startHealthCheck, 30000);
