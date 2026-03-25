# Walkthrough - Nilüfer Ormanlı Orchestra-v1

The "Nilüfer Ormanlı" Orchestra-v1 system is now ready. It provides a lightweight, fail-safe tracking layer using Vanilla JS and Cloudflare Pages.

## Accomplishments

- **Simplicity:** Removed React overhead; both the Admin Panel and Tracking Scripts are built with Vanilla JS/TS for maximum performance.
- **Fail-Safe Delivery:** Implemented a robust loader that switches to a backup domain if the primary delivery fail.
- **Scientific Attribution:** UTM parameters are captured and persisted in `localStorage`. `window.COS_DEBUG` allows real-time console auditing.
- **Pixel Integration:** Fully integrated GA4 (with cross-domain linker) and Meta Pixel.

## How to Deploy

1. **Cloudflare Pages & GitHub:**
   - Go to Cloudflare Dashboard -> Workers & Pages -> Create -> **Connect to Git**.
   - Select the `SignalPath-NiluferOrmanli` repository.
   - **Build Settings:**
     - Framework Preset: `Vite`
     - Build Command: `npm run build`
     - Build Output Directory: `dist`
   - **Environment Variables / Bindings:**
     - Go to Settings -> Functions -> **KV Namespace Bindings**.
     - Add a binding named `CONFIG_KV` and select your KV namespace.
     - Go to Settings -> **Variables and Secrets**.
     - Add a Variable named `ADMIN_TOKEN` and set it to a secure password of your choice.

2. **Domains:**
   - Point `scripts.niluferormanli.studio` (Primary) and `backup-scripts.niluferormanli.studio` (Backup) to your Cloudflare Pages deployment.

## Integration: Kartra Loader Snippet

Copy and paste this snippet into the **Tracking Code** section (Header) of your Kartra pages. This snippet will automatically load the main tracking engine.

```html
<!-- Nilüfer Orchestra-v1 Loader -->
<script src="https://scripts.niluferormanli.studio/loader.js"></script>
```

> [!TIP]
> To enable debug mode on any page, append `?cos_debug=true` to the URL. You will see detailed logs in the browser console prefix with `[COS]`.

## Event Verification

- **Page View:** Automatically fired on initial load with `lang`, `market`, and `campaign_id` dimensions.
- **Purchase:** The system expects Kartra data or manual triggers on the thank-you page. Tested with a generic `thankyou.js` entry point.

---
**Project Folder:** [nilufer-script-tracking](file:///Users/ekinyasa/Coding/projects/claude/nilufer-script-tracking)
**Build Assets:** [dist/assets](file:///Users/ekinyasa/Coding/projects/claude/nilufer-script-tracking/dist/assets)
