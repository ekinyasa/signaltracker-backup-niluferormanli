interface Env {
  CONFIG_KV: KVNamespace;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const config = await context.env.CONFIG_KV.get('nilufer_config', 'json');
  if (!config) {
    return new Response(JSON.stringify({
      gaId: 'G-XXXXXXXXXX',
      pixelId: 'XXXXXXXXXX',
      defaultLang: 'en',
      defaultMarket: 'global'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  return new Response(JSON.stringify(config), {
    headers: { 'Content-Type': 'application/json' }
  });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const newConfig = await context.request.json();
    await context.env.CONFIG_KV.put('nilufer_config', JSON.stringify(newConfig));
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid config' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
