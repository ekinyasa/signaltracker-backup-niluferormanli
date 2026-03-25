interface Env {
  SIGNAL_CONFIG_KV_NILUFER: KVNamespace;
  ADMIN_TOKEN?: string;
}

const DEFAULT_CONFIG = {
  gaId: 'G-XXXXXXXXXX',
  pixelId: 'XXXXXXXXXX',
  defaultLang: 'en',
  defaultMarket: 'global'
};

function checkAuth(request: Request, env: Env) {
  const token = request.headers.get('Authorization')?.split(' ')[1];
  if (env.ADMIN_TOKEN && token !== env.ADMIN_TOKEN) {
    return false;
  }
  return true;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  if (!context.env.SIGNAL_CONFIG_KV_NILUFER) {
    return new Response(JSON.stringify({ error: 'KV Binding "SIGNAL_CONFIG_KV_NILUFER" is missing.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const config = await context.env.SIGNAL_CONFIG_KV_NILUFER.get('nilufer_config', 'json');
  return new Response(JSON.stringify(config || DEFAULT_CONFIG), {
    headers: { 'Content-Type': 'application/json' }
  });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  if (!checkAuth(context.request, context.env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!context.env.SIGNAL_CONFIG_KV_NILUFER) {
    return new Response(JSON.stringify({ error: 'KV Binding "SIGNAL_CONFIG_KV_NILUFER" is missing.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const newConfig = await context.request.json();
    await context.env.SIGNAL_CONFIG_KV_NILUFER.put('nilufer_config', JSON.stringify(newConfig));
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
