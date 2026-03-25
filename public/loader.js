(function() {
  var PRIMARY_URL = 'https://scripts.niluferormanli.studio/assets/global.js';
  var BACKUP_URL = 'https://backup-scripts.niluferormanli.studio/assets/global.js';
  var VERSION = 'v1.0.0';

  function loadScript(url, isFallback) {
    var script = document.createElement('script');
    script.src = url + '?v=' + VERSION;
    script.async = true;
    
    script.onload = function() {
      if (isFallback) {
        console.warn('[COS] Primary failed, Fallback loaded: ' + url);
        // Optional: Fire a "ping" event to monitor reliability
      }
    };

    script.onerror = function() {
      if (!isFallback) {
        console.error('[COS] Primary delivery failed, switching to Backup...');
        loadScript(BACKUP_URL, true);
      } else {
        console.error('[COS] Critical: Both Primary and Backup delivery failed!');
      }
    };

    document.head.appendChild(script);
  }

  // Add debug mode from URL if present
  if (window.location.search.indexOf('cos_debug=true') !== -1) {
    window.COS_DEBUG = true;
  }

  // Initial load from Primary
  loadScript(PRIMARY_URL, false);
})();
