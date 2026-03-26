# Walkthrough - Signal-Path Platform (V3.1 Setup & Manual)

Version **3.1** focuses on production readiness and infrastructure synchronization.

## 1. Primary Setup (Cloudflare Pages)
- **Repo**: Use the main `nilufer-script-tracking` repository.
- **KV Storage**: Connect a Cloudflare KV namespace named `SIGNAL_KV`.
- **Environment**: Add `ADMIN_TOKEN` in Pages > Settings > Functions > Variables.

## 2. Backup Setup (Vercel)
- **Repo**: Use your backup repository (synced with main).
- **Environment**: Add `ADMIN_TOKEN` in Project Settings > Environment Variables (must match Primary).
- **Domain**: Add your backup domain (e.g., `signals.niluferormanlistudio.com`).
- **Webhook**: Set the Backup Webhook in the Primary Admin Panel to `https://[BACKUP-DOMAIN]/api/sync`.

## 3. The Promote Flow
1. **Configure**: Enter the backup webhook/key in the **Configuration** tab and save.
2. **Promote**: On the **Dashboard**, click **🚀 Promote to Backup**.
3. **Verify**: Check the **Tracking Pulse**. The backup status should turn green.

## 4. Maintenance
- **Sync**: Keep your Backup Git repo in sync with the Primary repo's `main` branch to receive platform updates (like V3.1+ logic).
- **Security**: The `ADMIN_TOKEN` acts as your master key. Keep it safe.
