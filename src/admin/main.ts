interface TrackingConfig {
    gaId: string;
    pixelId: string;
    defaultLang: string;
    defaultMarket: string;
}

// Elements
const loginGate = document.getElementById('loginGate')!;
const appHeader = document.getElementById('appHeader')!;
const appMain = document.getElementById('appMain')!;
const loginBtn = document.getElementById('loginBtn')!;
const loginTokenInput = document.getElementById('loginToken') as HTMLInputElement;
const logoutBtn = document.getElementById('logoutBtn')!;

const tabBtns = document.querySelectorAll('.tab-btn');
const sections = document.querySelectorAll('main > section');

const configForm = document.getElementById('configForm') as HTMLFormElement;
const pulsePrimary = document.getElementById('pulsePrimaryStatus')!;
const pulseBackup = document.getElementById('pulseBackupStatus')!;
const systemStatusValue = document.getElementById('systemStatusValue')!;
const toastContainer = document.getElementById('toastContainer')!;

// Constants
const PRIMARY_BASE = 'https://scripts.niluferormanli.studio/assets/header.js';
const BACKUP_BASE = 'https://backup-scripts.niluferormanli.studio/assets/header.js';

let currentToken = localStorage.getItem('COS_ADMIN_TOKEN') || '';

// --- Auth Logic ---
function showApp() {
    loginGate.classList.add('hidden');
    appHeader.classList.remove('hidden');
    appMain.classList.remove('hidden');
    loadConfig();
    startHealthChecks();
}

function showLogin() {
    loginGate.classList.remove('hidden');
    appHeader.classList.add('hidden');
    appMain.classList.add('hidden');
}

loginBtn.addEventListener('click', () => {
    const val = loginTokenInput.value.trim();
    if (val) {
        currentToken = val;
        localStorage.setItem('COS_ADMIN_TOKEN', val);
        showApp();
        showToast('Authorized successfully');
    }
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('COS_ADMIN_TOKEN');
    location.reload();
});

// --- Tab Logic ---
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = (btn as HTMLElement).dataset.tab;
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        sections.forEach(s => {
            s.classList.add('hidden');
            if (s.id === `tab-${target}`) s.classList.remove('hidden');
        });
    });
});

// --- Config Logic ---
async function loadConfig() {
    try {
        const res = await fetch('/api/config', {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        if (res.status === 401) return showLogin();
        if (!res.ok) throw new Error();
        
        const config: TrackingConfig = await res.json();
        (document.getElementById('gaId') as HTMLInputElement).value = config.gaId || '';
        (document.getElementById('pixelId') as HTMLInputElement).value = config.pixelId || '';
        (document.getElementById('defaultLang') as HTMLInputElement).value = config.defaultLang || '';
        (document.getElementById('defaultMarket') as HTMLInputElement).value = config.defaultMarket || '';
    } catch (e) {
        showToast('Failed to load configuration', 'error');
    }
}

configForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const config: TrackingConfig = {
        gaId: (document.getElementById('gaId') as HTMLInputElement).value,
        pixelId: (document.getElementById('pixelId') as HTMLInputElement).value,
        defaultLang: (document.getElementById('defaultLang') as HTMLInputElement).value,
        defaultMarket: (document.getElementById('defaultMarket') as HTMLInputElement).value,
    };

    try {
        const res = await fetch('/api/config', {
            method: 'POST',
            body: JSON.stringify(config),
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            }
        });
        if (res.ok) {
            showToast('Configuration applied safely');
        } else {
            showToast('Update failed. check token.', 'error');
        }
    } catch (e) {
        showToast('Network error', 'error');
    }
});

// --- Monitoring Logic ---
async function checkPulse() {
    const check = async (url: string, el: HTMLElement) => {
        try {
            const start = Date.now();
            await fetch(url, { method: 'HEAD', mode: 'no-cors' });
            const lat = Date.now() - start;
            el.textContent = `ONLINE (${lat}ms)`;
            el.style.color = 'var(--success)';
            return true;
        } catch {
            el.textContent = 'OFFLINE';
            el.style.color = 'var(--error)';
            return false;
        }
    };

    const p = await check(PRIMARY_BASE, pulsePrimary);
    const b = await check(BACKUP_BASE, pulseBackup);

    if (p && b) {
        systemStatusValue.innerHTML = '<span class="pill pill-success">Healthy</span>';
    } else if (p || b) {
        systemStatusValue.innerHTML = '<span class="pill pill-warning">Degraded</span>';
    } else {
        systemStatusValue.innerHTML = '<span class="pill pill-error">Critical</span>';
    }
}

function startHealthChecks() {
    checkPulse();
    setInterval(checkPulse, 30000);
}

// --- Utils ---
function showToast(msg: string, type: 'success' | 'error' = 'success') {
    const t = document.createElement('div');
    t.className = 'toast';
    if (type === 'error') t.style.background = 'var(--error)';
    t.textContent = msg;
    toastContainer.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

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
if (currentToken) showApp(); else showLogin();
