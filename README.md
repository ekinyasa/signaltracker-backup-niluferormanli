# Walkthrough - Signal-Path Platform (V2.5 Armor Plated)

Version **2.5** adds an extra layer of protection called "Global Guard" to prevent common tracking errors like double-counting.

## New Features in V2.5

### 1. Global Guard (Double-Loading Protection)
- **Problem**: If the tracking script is accidentally added to a page twice (e.g., once in a master template and once in a specific page), it usually fires events twice, ruining your data.
- **Solution**: Both our **Loader** and our **Main Script** now check for a global variable `__NILUFER_TRACKER_LOADED__`. If it exists, the second instance terminates immediately.
- **Safe Execution**: Your data remains clean even if the embed code is duplicated.

### 2. Sniper-Correct Snippets
- **Clarification**: When copying from the **Snippets** tab, you must copy the **entire block** (including the `(function() { ... })();` wrapper).
- **Functionality**: This entire block contains the logic to:
  - Check for double-loading.
  - Try the Primary CDN.
  - Fall back to the Backup CDN if needed.
  - Inject the scripts asynchronously.

## Deployment Status
- **Current Version**: `V2.5 | Hash`
- **Integrity**: Standard GA4 / Meta Pixel requirements are fully met.
- **Kartra Compatibility**: Confirmed for "Scripts" section.
