interface TrackingConfig {
    gaId: string;
    pixelId: string;
    defaultLang: string;
    defaultMarket: string;
}

const form = document.getElementById('configForm') as HTMLFormElement;
const statusEl = document.getElementById('status')!;
const tokenInput = document.getElementById('adminToken') as HTMLInputElement;
const primaryStatusEl = document.getElementById('primaryStatus')!;
const backupStatusEl = document.getElementById('backupStatus')!;
const overallHealthEl = document.getElementById('overallHealth')!;

const PRIMARY_URL = 'https://scripts.niluferormanli.studio/assets/global.js';
const BACKUP_URL = 'https://backup-scripts.niluferormanli.studio/assets/global.js';

// Load token from localStorage if exists
const storedToken = localStorage.getItem('COS_ADMIN_TOKEN');
if (storedToken) {
    tokenInput.value = storedToken;
}

async function loadConfig() {
    try {
        const response = await fetch('/api/config');
        if (!response.ok) throw new Error('Failed to fetch config');
        
        const config: TrackingConfig = await response.json();
        
        (document.getElementById('gaId') as HTMLInputElement).value = config.gaId || '';
        (document.getElementById('pixelId') as HTMLInputElement).value = config.pixelId || '';
        (document.getElementById('defaultLang') as HTMLInputElement).value = config.defaultLang || '';
        (document.getElementById('defaultMarket') as HTMLInputElement).value = config.defaultMarket || '';
    } catch (e) {
        console.error('Failed to load config', e);
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const token = tokenInput.value;
    localStorage.setItem('COS_ADMIN_TOKEN', token);

    const config: TrackingConfig = {
        gaId: (document.getElementById('gaId') as HTMLInputElement).value,
        pixelId: (document.getElementById('pixelId') as HTMLInputElement).value,
        defaultLang: (document.getElementById('defaultLang') as HTMLInputElement).value,
        defaultMarket: (document.getElementById('defaultMarket') as HTMLInputElement).value,
    };

    try {
        const response = await fetch('/api/config', {
            method: 'POST',
            body: JSON.stringify(config),
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();

        if (response.ok) {
            statusEl.textContent = 'Saved Successfully!';
            statusEl.className = 'status success';
            setTimeout(() => { statusEl.className = 'status'; }, 3000);
        } else {
            statusEl.textContent = `Error: ${result.error || 'Failed to save'}`;
            statusEl.className = 'status error'; // We should add error style to CSS
            statusEl.style.display = 'block';
            statusEl.style.background = 'rgba(239, 68, 68, 0.1)';
            statusEl.style.color = '#ef4444';
        }
    } catch (e) {
        alert('Failed to save configuration. check console for details.');
    }
});

async function checkHealth() {
    const check = async (url: string, el: HTMLElement) => {
        try {
            const start = Date.now();
            await fetch(url, { method: 'HEAD', mode: 'no-cors', cache: 'no-cache' });
            const duration = Date.now() - start;
            el.textContent = `Online (${duration}ms)`;
            el.style.color = '#10b981';
            return true;
        } catch (e) {
            el.textContent = 'Offline';
            el.style.color = '#ef4444';
            return false;
        }
    };

    const p = await check(PRIMARY_URL, primaryStatusEl);
    const b = await check(BACKUP_URL, backupStatusEl);

    if (p && b) {
        overallHealthEl.textContent = 'SYSTEM HEALTHY';
        overallHealthEl.style.color = '#10b981';
    } else if (p || b) {
        overallHealthEl.textContent = 'DEGRADED PERFORMANCE (FALLBACK ACTIVE)';
        overallHealthEl.style.color = '#f59e0b';
    } else {
        overallHealthEl.textContent = 'CRITICAL: ALL SYSTEMS OFFLINE';
        overallHealthEl.style.color = '#ef4444';
    }
}

loadConfig();
checkHealth();
setInterval(checkHealth, 30000); // Check every 30 seconds
