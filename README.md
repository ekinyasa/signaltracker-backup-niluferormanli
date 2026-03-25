# Walkthrough - Signal-Path Platform (V2.4 Standardization)

Version **2.4** ensures 100% compatibility with official advertising standards while bypassing the strict HTML limitations of platforms like Kartra.

## Key Technical Standards in V2.4

### 1. Self-Loading CDN Loader (Kartra Friendly)
- **Problem**: Some platforms only allow `<script>` tags and lack custom HTML support.
- **Solution**: The Admin Panel now generates a self-executing JS function.
- **Reliability**: It tries the **Primary CDN** and if it fails (or takes >2.5s), it automatically falls back to the **Backup CDN**.
- **Compatibility**: No more `<noscript>` or `<meta>` tags needed in the raw HTML; the loader handles everything.

### 2. JS-Based Tag Injection
- **Meta Verification**: The system dynamically injects the `facebook-domain-verification` meta tag into the `<head>` via JavaScript.
- **Noscript Pixel**: Even though JS is required to run our scripts, we now inject a hidden `<img>` tracking pixel into the DOM to satisfy Meta's audit requirements.

### 3. Precision Tracking
- **Official Snippet Match**: The GA4 (`gtag`) and Meta Pixel (`fbq`) initialization logic now exactly matches the latest official snippets from Google and Meta.
- **Improved Linker**: GA4 cross-domain tracking is pre-configured with your `siteDomain`.

## How to use V2.4 Snippets
1. Go to the **Snippets** tab in the Admin Panel.
2. Copy the **Source Embed** (it is now a clean JS block).
3. Paste it into Kartra's script section.
4. Profit from automatic CDN fallback and 100% standard tracking.

## Verification
- Check your browser's `<head>`: You should see the `facebook-domain-verification` tag appears after the script loads.
- Check Network Tab: You should see the Meta Pixel `tr?id=...` request firing even without a traditional `<noscript>` tag.
