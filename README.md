# Walkthrough - Signal-Path Platform (V2.6 Precision Monitoring)

Version **2.6** introduces granular health monitoring to ensure your tracking scripts are not just "hosted" but actually "reachable" at their unique paths.

## Key Improvements in V2.6

### 1. Precision Pulse UI
- **Dual Validation**: The "Tracking Pulse" card now shows two status columns for both Primary and Backup CDNs.
- **Server Status**: Confirms the underlying infrastructure and CDN are responding.
- **Script Status**: Confirms that the specific project and version you are managing exists and is ready to be served.

### 2. Intelligent Status States
- **Healthy**: Both your Primary and Backup script paths are reachable.
- **Degraded**: At least one script path is reachable, but one is failing (e.g., Primary is down, Backup is serving).
- **Critical**: No script paths are reachable. Even if the server is "Online", if the script path returns 404, it will show "Critical".

## How to use V2.6 Monitoring
1. Look at the **Dashboard** (Monitoring tab).
2. Check the **Server** column: If green, your infrastructure is up.
3. Check the **Script** column: If green, your project-specific tracking code is active and reachable by Kartra.

## Verification
- Version: `V2.6 | Hash`
- Try switching projects: The "Script" column will re-verify the full path for the newly selected project version.
