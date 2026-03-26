export const onRequest: PagesFunction = async (context) => {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const projectId = url.searchParams.get('project');
    const auth = request.headers.get('Authorization');

    // Security: Check admin token
    if (auth !== `Bearer ${env.ADMIN_TOKEN}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    if (!projectId) {
      return new Response(JSON.stringify({ error: 'Missing project ID' }), { status: 400 });
    }

    // 1. Get current config from KV
    const kv = env.SIGNAL_CONFIG_KV_NILUFER as KVNamespace;
    const configRaw = await kv.get(`signal_project_${projectId}`);
    if (!configRaw) {
      return new Response(JSON.stringify({ error: 'Project not found' }), { status: 404 });
    }

    const config = JSON.parse(configRaw);
    const { backupWebhook, backupDeployKey } = config;

    if (!backupWebhook) {
      return new Response(JSON.stringify({ error: 'Backup webhook not configured for this project' }), { status: 400 });
    }

    // 2. Relay to Backup
    try {
      const backupRes = await fetch(backupWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Signal-Key': backupDeployKey || '',
          'Authorization': `Bearer ${env.ADMIN_TOKEN}`
        },
        body: JSON.stringify({
          action: 'sync_config',
          project: config
        })
      });

      let backupData;
      try {
          const isJson = backupRes.headers.get('content-type')?.includes('application/json');
          backupData = isJson ? await backupRes.json() : await backupRes.text();
      } catch (parseError) {
          backupData = "Could not parse backup response: " + String(parseError);
      }

      return new Response(JSON.stringify({
        success: backupRes.ok,
        status: backupRes.status,
        backup_response: backupData,
        debug: {
            webhook: backupWebhook,
            has_key: !!backupDeployKey,
            has_token: !!env.ADMIN_TOKEN
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e) {
      return new Response(JSON.stringify({
        success: false,
        error: 'CRITICAL_FETCH_FAILURE',
        message: String(e),
        context: { webhook: backupWebhook }
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  } catch (globalError) {
    return new Response(JSON.stringify({
      success: false,
      error: 'UNHANDLED_WORKER_EXCEPTION',
      message: String(globalError)
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
