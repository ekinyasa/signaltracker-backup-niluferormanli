interface Env {
  SIGNAL_CONFIG_KV_NILUFER: KVNamespace;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const pathParts = url.pathname.split('/');
  // Expected: /api/scripts/:project/:version/:type.js
  const project = pathParts[3];
  const version = pathParts[4];
  const filename = pathParts[5];

  if (!project || !version || !filename) {
    return new Response('Not Found', { status: 404 });
  }

  // Fetch specialized config for this version
  const projectData = await context.env.SIGNAL_CONFIG_KV_NILUFER.get(`signal_project_${project}`, 'json') as any;
  if (!projectData) return new Response('Project Not Found', { status: 404 });

  let targetConfig = projectData;
  if (version !== 'latest') {
      const vData = projectData.versions?.find((v: any) => v.id === version);
      if (vData) targetConfig = vData.config;
  }

  // Template selection based on filename (header.js, checkout.js, thankyou.js)
  // For now, we use a simple injection. In a real scenario, we'd read bundled assets.
  // We'll use the compiled code but wrap it in a config injection.

  const scriptType = filename.split('.')[0];
  
  // Base script templates (Simplified for this version)
  // Note: Usually we'd use the versioned files from the build, but here we're doing dynamic injection.
  const js = `
    (function() {
      window.COS_CONFIG = ${JSON.stringify(targetConfig)};
      window.COS_PROJECT = "${project}";
      window.COS_VERSION = "${version}";
      
      // Load the actual logic script (compiled by Vite)
      const s = document.createElement('script');
      s.src = '/assets/${scriptType}.js'; // Pointing to the latest core logic
      s.async = true;
      document.head.appendChild(s);
    })();
  `;

  return new Response(js, {
    headers: { 'Content-Type': 'application/javascript', 'Cache-Control': 'public, max-age=3600' }
  });
};
