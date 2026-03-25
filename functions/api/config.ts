interface Env {
  SIGNAL_CONFIG_KV_NILUFER: KVNamespace;
  ADMIN_TOKEN?: string;
}

function checkAuth(request: Request, env: Env) {
  const token = request.headers.get('Authorization')?.split(' ')[1];
  if (env.ADMIN_TOKEN && token !== env.ADMIN_TOKEN) {
    return false;
  }
  return true;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  if (!checkAuth(context.request, context.env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const url = new URL(context.request.url);
  const projectId = url.searchParams.get('project');
  
  if (!projectId) {
      return new Response(JSON.stringify({ error: 'Project ID required' }), { status: 400 });
  }

  const config = await context.env.SIGNAL_CONFIG_KV_NILUFER.get(`signal_project_${projectId}`, 'json');
  return new Response(JSON.stringify(config || {}), {
    headers: { 'Content-Type': 'application/json' }
  });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  if (!checkAuth(context.request, context.env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const url = new URL(context.request.url);
  const projectId = url.searchParams.get('project');
  
  if (!projectId) {
      return new Response(JSON.stringify({ error: 'Project ID required' }), { status: 400 });
  }

  try {
    const newConfig = await context.request.json() as any;
    
    // Versioning logic
    const currentConfigStr = await context.env.SIGNAL_CONFIG_KV_NILUFER.get(`signal_project_${projectId}`);
    const currentConfig = currentConfigStr ? JSON.parse(currentConfigStr) : { versions: [] };
    
    const versionId = `v${(currentConfig.versions?.length || 0) + 1}`;
    const snapshot = {
        id: versionId,
        timestamp: Date.now(),
        config: { ...newConfig }
    };

    const finalConfig = {
        ...newConfig,
        activeVersion: versionId,
        versions: [snapshot, ...(currentConfig.versions || [])].slice(0, 10) // Keep last 10 versions
    };

    await context.env.SIGNAL_CONFIG_KV_NILUFER.put(`signal_project_${projectId}`, JSON.stringify(finalConfig));
    return new Response(JSON.stringify({ success: true, version: versionId }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid config payload' }), { status: 400 });
  }
};
