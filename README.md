# Walkthrough - Signal-Path Platform (Multi-Project V2)

The system has evolved into a professional **Multi-Project Tracking Platform**. You can now manage multiple funnels, handle versions, and use ready-made presets from a single dashboard.

## Key Capabilities (V2)

### 1. Multi-Project Management
- **Sidebar Selector**: Easily switch between independent projects.
- **Project Specific Settings**: Each project has its own GA/Meta IDs, Domains, and Attribution rules.
- **Creation Flow**: "New Project" button to bootstrap a fresh tracking environment in seconds.

### 2. Version Control & Rollback
- **Auto-Snapshots**: Every time you save a configuration, a new version (v1, v2...) is created.
- **One-Click Rollback**: Instantly revert to a previous version if a configuration error occurs.
- **Dynamic Delivery**: Scripts are served via `/api/scripts/{project}/{version}/header.js`, ensuring they always match the selected version's config.

### 3. Smart Presets & Logic
- **Kartra Funnel**: Standard tracking with ViewContent -> InitiateCheckout -> Purchase.
- **Simple Landing**: Lightweight tracking for standalone pages.
- **Minimal Mode**: Analytics-only (GA) mode that completely bypasses Meta Pixel scripts for privacy or speed.
- **Adjustable TTL**: Set custom attribution windows (default 7 days).

### 4. Integrated Monitoring & Help
- **Pulse Check**: Real-time monitoring of script domains for each project.
- **Unified Snippets**: Copy-paste ready codes for Header, Checkout, and Thank-you pages.
- **Platform Manual**: In-app "DO/DON'T" guide for best practices.

## How to Get Started
1. Open your Admin Panel and login with `ADMIN_TOKEN`.
2. Click **"+ New Project"** and name it.
3. In **Configuration**, enter your GA and Meta IDs.
4. Select a **Preset** (e.g., Kartra Standard).
5. Click **"Generate New Version"**.
6. Go to the **Snippets** tab and copy your codes.

## Important: KV Configuration
For multi-project to work, ensures your Cloudflare Pages KV Namespace is bound to `SIGNAL_CONFIG_KV_NILUFER`. The system handles the rest!
