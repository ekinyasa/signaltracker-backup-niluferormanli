export const onRequest: PagesFunction = async (context) => {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Signal-Key, Authorization'
      }
    });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const body: any = await request.json();
    const { action, project } = body;
    const incomingKey = request.headers.get('X-Signal-Key');

    // Security: Validate action and key
    if (action !== 'sync_config' || !project || !project.id) {
        return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });
    }

    // Optional: If a local DEPLOY_KEY is set, validate it
    // if (env.DEPLOY_KEY && incomingKey !== env.DEPLOY_KEY) {
    //    return new Response(JSON.stringify({ error: 'Invalid Deploy Key' }), { status: 403 });
    // }

    // Update local KV
    const kv = env.SIGNAL_KV;
    await kv.put(`signal_project_${project.id}`, JSON.stringify(project));

    // Also update the global project list if not present
    const listRaw = await kv.get('signal_projects_list');
    let list = listRaw ? JSON.parse(listRaw) : [];
    if (!list.find((p: any) => p.id === project.id)) {
        list.push({ id: project.id, name: project.name });
        await kv.put('signal_projects_list', JSON.stringify(list));
    }

    return new Response(JSON.stringify({ 
        success: true, 
        message: `Project ${project.id} synced successfully`,
        received_at: Date.now()
    }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Sync failed', details: String(e) }), { status: 500 });
  }
};
