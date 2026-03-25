import type { ProjectConfig } from '../scripts/types';

// State
let projects: any[] = [];
let currentProject: ProjectConfig | null = null;
let currentToken = localStorage.getItem('COS_ADMIN_TOKEN') || '';

// Elements
const sidebarProjects = document.getElementById('sidebarProjects')!;
const appMain = document.getElementById('appMain')!;
const loginGate = document.getElementById('loginGate')!;
const appHeader = document.getElementById('appHeader')!;

const configForm = document.getElementById('configForm') as HTMLFormElement;
const systemStatusValue = document.getElementById('systemStatusValue')!;
const pulsePrimary = document.getElementById('pulsePrimaryStatus')!;
const pulseBackup = document.getElementById('pulseBackupStatus')!;
const toastContainer = document.getElementById('toastContainer')!;

// --- Auth ---
function showLogin() {
    loginGate.classList.remove('hidden');
    appHeader.classList.add('hidden');
    appMain.classList.add('hidden');
}

function showApp() {
    loginGate.classList.add('hidden');
    appHeader.classList.remove('hidden');
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

// --- Project Management ---
async function loadProjects() {
    try {
        const res = await fetch('/api/projects', {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        if (res.status === 401) return showLogin();
        projects = await res.json();
        renderSidebar();
        if (projects.length > 0) switchProject(projects[0].id);
    } catch (e) {
        showToast('Failed to load projects', 'error');
    }
}

function renderSidebar() {
    sidebarProjects.innerHTML = projects.map(p => `
        <div class="project-item ${currentProject?.id === p.id ? 'active' : ''}" data-id="${p.id}">
            ${p.name}
        </div>
    `).join('') + `
        <button id="newProjectBtn" class="primary" style="margin-top:1rem; width:100%;">+ New Project</button>
    `;
    
    document.querySelectorAll('.project-item').forEach(item => {
        item.addEventListener('click', () => switchProject((item as HTMLElement).dataset.id!));
    });

    document.getElementById('newProjectBtn')?.addEventListener('click', createProject);
}

async function createProject() {
    const name = prompt('Project Name:');
    if (!name) return;
    const id = name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
    
    const newProject: Partial<ProjectConfig> = {
        id,
        name,
        siteDomain: '',
        scriptDomain: '',
        backupDomain: '',
        ttlDays: 7,
        attributionModel: 'last_click',
        preset: 'kartra_standard'
    };

    try {
        await fetch('/api/projects', {
            method: 'POST',
            body: JSON.stringify(newProject),
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            }
        });
        showToast('Project Created');
        loadProjects();
    } catch (e) {
        showToast('Failed to create project', 'error');
    }
}

async function switchProject(id: string) {
    try {
        const res = await fetch(`/api/config?project=${id}`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        currentProject = await res.json();
        renderSidebar();
        renderProjectConfig();
        startHealthCheck();
        updateSnippets();
    } catch (e) {
        showToast('Failed to load project config', 'error');
    }
}

function renderProjectConfig() {
    if (!currentProject) return;
    (document.getElementById('projectNameDisplay') as HTMLElement).textContent = currentProject.name;
    (document.getElementById('gaId') as HTMLInputElement).value = currentProject.gaId || '';
    (document.getElementById('pixelId') as HTMLInputElement).value = currentProject.pixelId || '';
    (document.getElementById('siteDomain') as HTMLInputElement).value = currentProject.siteDomain || '';
    (document.getElementById('scriptDomain') as HTMLInputElement).value = currentProject.scriptDomain || '';
    (document.getElementById('backupDomain') as HTMLInputElement).value = currentProject.backupDomain || '';
    (document.getElementById('preset') as HTMLSelectElement).value = currentProject.preset || 'kartra_standard';
    
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
    const { scriptDomain, backupDomain } = currentProject;
    
    const check = async (domain: string, el: HTMLElement) => {
        if (!domain) return false;
        try {
            const start = Date.now();
            await fetch(`https://${domain}/assets/header.js`, { method: 'HEAD', mode: 'no-cors' });
            const lat = Date.now() - start;
            el.textContent = `Online (${lat}ms)`;
            el.style.color = 'var(--success)';
            return true;
        } catch {
            el.textContent = 'Offline';
            el.style.color = 'var(--error)';
            return false;
        }
    };

    const p = await check(scriptDomain, pulsePrimary);
    const b = await check(backupDomain, pulseBackup);

    if (p && b) systemStatusValue.innerHTML = '<span class="pill pill-success">Healthy</span>';
    else if (p || b) systemStatusValue.innerHTML = '<span class="pill pill-warning">Degraded</span>';
    else systemStatusValue.innerHTML = '<span class="pill pill-error">Critical</span>';
}

// --- Utils ---
function showToast(msg: string, type: 'success' | 'error' = 'success') {
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = msg;
    toastContainer.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

function updateSnippets() {
    if (!currentProject) return;
    const ver = currentProject.activeVersion || 'latest';
    const base = `https://${currentProject.scriptDomain || 'scripts.domain.com'}/api/scripts/${currentProject.id}/${ver}`;
    
    (document.getElementById('snippetHeader') as HTMLElement).textContent = `<script src="${base}/header.js"></script>`;
    (document.getElementById('snippetCheckout') as HTMLElement).textContent = `<script src="${base}/checkout.js"></script>`;
    (document.getElementById('snippetThankyou') as HTMLElement).textContent = `<script src="${base}/thankyou.js"></script>`;
}

configForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentProject) return;

    const data = {
        gaId: (document.getElementById('gaId') as HTMLInputElement).value,
        pixelId: (document.getElementById('pixelId') as HTMLInputElement).value,
        siteDomain: (document.getElementById('siteDomain') as HTMLInputElement).value,
        scriptDomain: (document.getElementById('scriptDomain') as HTMLInputElement).value,
        backupDomain: (document.getElementById('backupDomain') as HTMLInputElement).value,
        preset: (document.getElementById('preset') as HTMLSelectElement).value,
        id: currentProject.id,
        name: currentProject.name
    };

    try {
        await fetch(`/api/config?project=${currentProject.id}`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            }
        });
        showToast('Version Generated (Snapshot Created)');
        switchProject(currentProject.id); // Reload
    } catch (e) {
        showToast('Save failed', 'error');
    }
});

// --- Tabs ---
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = (btn as HTMLElement).dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('main > .container > section').forEach(s => s.classList.add('hidden'));
        document.getElementById(`tab-${target}`)?.classList.remove('hidden');
    });
});

// Copy Logic
document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = (btn as HTMLElement).dataset.target!;
        const code = document.getElementById(targetId)!.textContent!;
        navigator.clipboard.writeText(code);
        showToast('Snippet copied to clipboard');
    });
});

// Init
authCheck();
setInterval(startHealthCheck, 30000);
