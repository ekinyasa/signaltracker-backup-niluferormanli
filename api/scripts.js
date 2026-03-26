// V3.3.1 Vercel Script Renderer
// Handles: /api/scripts/[id]/[ver]/[type].js

// In-memory "Sync Cache" for Vercel (Lives during Lambda warmth)
global.SIGNAL_CACHE = global.SIGNAL_CACHE || {};

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'no-store');

  const { path } = req.query; // From vercel.json rewrite
  if (!path) return res.status(404).send('// Missing path');

  const parts = path.split('/');
  const project = parts[0];
  const version = parts[1];
  const filename = parts[2];

  if (!project || !version || !filename) {
    return res.status(404).send('// Path structure error');
  }

  // Get cached config from Sync
  const config = global.SIGNAL_CACHE[`project_${project}`];

  if (!config) {
    return res.status(200).send(`// Vercel Placeholder: Project ${project} sync pending...`);
  }

  const scriptType = filename.split('.')[0];

  const js = `
    (function() {
      window.COS_CONFIG = ${JSON.stringify(config)};
      window.COS_PROJECT = "${project}";
      window.COS_VERSION = "${version}";
      // Note: In Vercel, assets must be served from /public or /dist
      const s = document.createElement('script');
      s.src = 'https://' + window.COS_CONFIG.scriptDomain + '/assets/${scriptType}.js';
      s.async = true;
      document.head.appendChild(s);
    })();
  `;

  res.status(200).send(js);
}
