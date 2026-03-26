export const onRequest: PagesFunction = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const target = url.searchParams.get('target');
  const auth = request.headers.get('Authorization');

  // Security: Check token
  if (auth !== `Bearer ${env.ADMIN_TOKEN}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  if (!target) {
    return new Response(JSON.stringify({ error: 'Missing target' }), { status: 400 });
  }

  try {
    const start = Date.now();
    // Use a short timeout for the fetch
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(target, { 
        method: 'HEAD',
        signal: controller.signal,
        redirect: 'follow'
    });
    
    clearTimeout(id);
    const lat = Date.now() - start;

    return new Response(JSON.stringify({
      ok: res.ok,
      status: res.status,
      latency: lat
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({
      ok: false,
      status: 'offline',
      latency: 0
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
