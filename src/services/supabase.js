const { createClient } = require('@supabase/supabase-js');

// Use server-side service role key from env. Keep this file server-only and never commit service_role to git.
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_KEY;
const BUCKET = process.env.SUPABASE_BUCKET || 'uploads';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('Supabase service not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE (or SUPABASE_KEY) in .env');
}

let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    // For Node < 22, provide a ws transport to the realtime client to avoid native WebSocket requirement
    let transport = undefined;
    try {
      // prefer a lightweight ws implementation if available
      // eslint-disable-next-line global-require
      const ws = require('ws');
      transport = ws;
    } catch (e) {
      // ws not installed; realtime may fail on older Node versions
      transport = undefined;
    }

    const opts = transport ? { realtime: { transport } } : {};
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, opts);
  } catch (err) {
    console.warn('Failed to initialize Supabase client in CI; continuing without Supabase:', err && err.message ? err.message : err);
    supabase = null;
  }
}

module.exports = {
  supabase,
  bucket: BUCKET,

  async uploadBuffer(path, buffer, contentType) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
      contentType,
      upsert: false,
    });
    if (error) throw error;
    return data;
  },

  getPublicUrl(path) {
    if (!supabase) return null;
    return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  },

  async remove(path) {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) throw error;
    return true;
  },
}
