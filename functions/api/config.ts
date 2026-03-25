interface Env {
  CONFIG_KV: KVNamespace;
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
  // If ADMIN_TOKEN is not set in Env, we allow it for now, but recommend setting it
  if (env.ADMIN_TOKEN && token !== env.ADMIN_TOKEN) {
    return false;
  }
  return true;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  if (!context.env.CONFIG_KV) {
    return new Response(JSON.stringify({ error: 'KV Binding "CONFIG_KV" is missing in Cloudflare Settings.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const config = await context.env.CONFIG_KV.get('nilufer_config', 'json');
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

  if (!context.env.CONFIG_KV) {
    return new Response(JSON.stringify({ error: 'KV Binding "CONFIG_KV" is missing.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const newConfig = await context.request.json();
    await context.env.CONFIG_KV.put('nilufer_config', JSON.stringify(newConfig));
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
