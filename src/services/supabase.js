const { createClient } = require('@supabase/supabase-js');

// Use server-side service role key from env. Keep this file server-only and never commit service_role to git.
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_KEY;
const BUCKET = process.env.SUPABASE_BUCKET || 'uploads';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('Supabase service not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE (or SUPABASE_KEY) in .env');
}

const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

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
