# Walkthrough - Nilüfer Ormanlı Orchestra-v1 (Signal-Path Optimization)

The system has been upgraded to a production-ready "Command Center" with segmented tracking and professional UI.

## Changes Made

### 1. Script Segmentation
- **Header Script (`header.js`)**: Handles attribution capture (Last-Click) and pixel initialization. Fires `page_view`.
- **Checkout Script (`checkout.js`)**: Specifically for checkout pages. Fires `begin_checkout` (GA4) and `InitiateCheckout` (Meta).
- **Thank-You Script (`thankyou.js`)**: Fires `purchase` events and performs **Session Cleanup** (removes attribution data from localStorage after conversion).

### 2. Admin Command Center
- **Login Gate**: Secure access using the `ADMIN_TOKEN`.
- **Infrastructure Pulse**: Real-time HTTP health checks for Primary and Backup CDN URLs.
- **Tabbed Interface**:
  - **Monitoring**: System status summary and emergency action center.
  - **Configuration**: Direct control over Tracking IDs and defaults.
  - **Snippets**: Dynamic embed code generator with one-tap copy functionality.

### 3. Data Integrity & Resilience
- **Last-Click Attribution**: Updates stored parameters if a user arrives with new UTMs.
- **Fail-Safe Delivery**: Standard loader pattern with automatic fallback.
- **Debug Mode**: `?cos_debug=true` prints the full attribution payload and event status.

## How to use the new Admin Panel
1. Access your `pages.dev` URL.
2. Enter your `ADMIN_TOKEN`.
3. Use the **Configuration** tab to set IDs.
4. Copy the scripts from the **Snippets** tab and paste them into Kartra appropriately.

## Verification Results
- [x] **Auth Check**: Unauthorized access is blocked.
- [x] **Health Check**: Dashboard correctly identifies "Online" vs "Offline" status.
- [x] **Event Firing**: Validated `header`, `checkout`, and `thankyou` segments fire events with correct payloads.
- [x] **Storage Cleanup**: Storage is wiped after purchase success.
