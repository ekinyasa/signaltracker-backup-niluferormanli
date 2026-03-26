# Walkthrough - Signal-Path Platform (V2.8 Robust Monitoring)

Version **2.8** fixes specific edge cases where Backup servers (like Vercel) would falsely appear as Offline due to missing browser permissions or asset paths.

## Key Technical Upgrades in V2.8

### 1. Multi-Platform CORS Support
- **Full Compatibility**: Added both Cloudflare `_headers` and Vercel `vercel.json` configuration files.
- **Result**: The Admin Panel can now reliably check the status of your servers even when they are hosted on different providers, without being blocked by "CORS" security errors.

### 2. Dedicated Health Endpoint (`/api/health`)
- **Infrastructure Check**: We no longer rely on specific file paths (like `/assets/header.js`) to check if a server is alive.
- **Reliability**: Every Signal-Path instance now includes an `/api/health` endpoint that strictly confirms the server and its API engine are functioning correctly.

### 3. Clearer Pulse Categories
- **Server Column**: Now specifically indicates if the **Infrastructure/CDN** is responding via the health endpoint.
- **Script Column**: Specifically indicates if the **Dynamic Project Configuration** is reachable at its unique path.

## How to use V2.8 Monitoring
1. In the **Tracking Pulse** card, you will now see:
   - `Server`: Should be green if the hosting (Vercel/Cloudflare) is up.
   - `Script`: Should be green if the project is deployed, or `✗ 404` if the version is missing.

## Verification
- Version: `V2.8 | Hash`
- Backup Server: Should now show `✓ Online` in the Server column if configured correctly on Vercel.
