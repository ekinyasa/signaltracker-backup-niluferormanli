interface TrackingConfig {
    gaId: string;
    pixelId: string;
    defaultLang: string;
    defaultMarket: string;
}

const form = document.getElementById('configForm') as HTMLFormElement;
const statusEl = document.getElementById('status')!;

// Load current config
async function loadConfig() {
    try {
        const response = await fetch('/api/config');
        const config: TrackingConfig = await response.json();
        
        (document.getElementById('gaId') as HTMLInputElement).value = config.gaId;
        (document.getElementById('pixelId') as HTMLInputElement).value = config.pixelId;
        (document.getElementById('defaultLang') as HTMLInputElement).value = config.defaultLang;
        (document.getElementById('defaultMarket') as HTMLInputElement).value = config.defaultMarket;
    } catch (e) {
        console.error('Failed to load config', e);
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
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
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
            statusEl.className = 'status success';
            setTimeout(() => { statusEl.className = 'status'; }, 3000);
        }
    } catch (e) {
        alert('Failed to save configuration');
    }
});

loadConfig();
