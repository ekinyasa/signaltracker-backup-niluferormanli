// V3.2 Sync Receiver for Vercel
// Note: Vercel requires KV/Redis for persistent storage.
// This adapter provides the sync skeleton.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Signal-Key, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, project } = req.body;
  const adminToken = process.env.ADMIN_TOKEN;
  const auth = req.headers.authorization;

  // Security: Check token
  if (auth !== `Bearer ${adminToken}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (action === 'sync_config' && project) {
    // SUCCESS: In a real Vercel setup, we would save to @vercel/kv here.
    // For now, we return success to confirm connectivity and code execution.
    return res.status(200).json({
        success: true,
        message: `Project ${project.id} received by Vercel Backup Component.`,
        platform: 'vercel',
        warning: 'Note: Ensure Vercel KV is connected for persistent backup storage.'
    });
  }

  res.status(400).json({ error: 'Invalid payload' });
}
