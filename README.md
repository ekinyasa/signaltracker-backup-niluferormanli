# Walkthrough - Signal-Path Platform (V3.0 Promote Flow)

Version **3.0** evolves the platform into an orchestrator with the new "Promote" flow, enabling one-click synchronization between your Primary and Backup servers.

## Key Features in V3.0

### 1. Promoting Config to Backup
- **The Problem**: Previously, you had to manually ensure the Backup server had the same project configuration as the Primary.
- **The Solution**: We've added a **"🚀 Promote to Backup"** button. When clicked, the Primary server securely pushes its current configuration to the Backup server's webhook.
- **Automation**: This can also be used to trigger external CI/CD pipelines (like Vercel Deploy Hooks).

### 2. Backup Webhook & Sync Security
- **Configurable**: In the **Configuration** tab, you can now set a `Backup Webhook` (e.g., `https://backup.yoursite.com/api/sync`).
- **Secure**: You can define a `Backup Deploy Key` to ensure only your authorized Primary server can push updates to the Backup.

### 3. Cross-Server Synchronization (`/api/sync`)
- Every Signal-Path instance now has a built-in receiver at `/api/sync` that listens for promotion requests and automatically updates its local database.

## How to use V3.0 Promote Flow
1. Go to the **Configuration** tab for your project.
2. Enter your **Backup Webhook URL** (usually your backup domain + `/api/sync`).
3. Click "Save & Deploy".
4. Go to the **Dashboard** and click **"🚀 Promote to Backup"**.
5. Check your **Tracking Pulse**: The Backup "Script" status should turn green almost immediately!

## Verification
- Version: `V3.0 | Hash`
- Status: Server-to-Server health checks and Promoting are fully operational.
