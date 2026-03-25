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

  const list = await context.env.SIGNAL_CONFIG_KV_NILUFER.get('signal_projects_list', 'json');
  return new Response(JSON.stringify(list || []), {
    headers: { 'Content-Type': 'application/json' }
  });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  if (!checkAuth(context.request, context.env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const projectMeta = await context.request.json() as any;
    const currentList = await context.env.SIGNAL_CONFIG_KV_NILUFER.get('signal_projects_list', 'json') as any[] || [];
    
    // Simple push or update by ID
    const index = currentList.findIndex(p => p.id === projectMeta.id);
    if (index > -1) {
        currentList[index] = projectMeta;
    } else {
        currentList.push(projectMeta);
    }

    await context.env.SIGNAL_CONFIG_KV_NILUFER.put('signal_projects_list', JSON.stringify(currentList));
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });
  }
};
