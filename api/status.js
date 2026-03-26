export default async function handler(req, res) {
  const { target } = req.query;
  const auth = req.headers.authorization;
  const adminToken = process.env.ADMIN_TOKEN;

  if (auth !== `Bearer ${adminToken}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!target) {
    return res.status(400).json({ error: 'Missing target' });
  }

  try {
    const start = Date.now();
    const response = await fetch(target, { method: 'HEAD' });
    const latency = Date.now() - start;

    res.status(200).json({
      ok: response.ok,
      status: response.status,
      latency
    });
  } catch (e) {
    res.status(200).json({
      ok: false,
      status: 'offline',
      latency: 0
    });
  }
}
