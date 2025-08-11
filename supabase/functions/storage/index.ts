// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, serviceRoleKey);

function json(data: any, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    ...init,
  });
}

serve(async (req: Request) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
    }
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (action === 'getPublicUrl') {
      const { filePath } = await req.json();
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath);
      return json({ publicUrl });
    }

    // For uploads, expect multipart form-data
    if (action === 'upload') {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const folder = (formData.get('folder') as string) || 'avatars';
      if (!file) return json({ error: 'Missing file' }, { status: 400 });
      const ext = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
      const arrayBuffer = await file.arrayBuffer();
      const { error } = await supabase.storage.from('images').upload(fileName, arrayBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
      return json({ publicUrl, filePath: fileName }, { status: 201 });
    }

    if (action === 'delete') {
      const { filePath } = await req.json();
      const { error } = await supabase.storage.from('images').remove([filePath]);
      if (error) throw error;
      return json({ ok: true });
    }

    return json({ error: 'Unknown action' }, { status: 400 });
  } catch (e) {
    console.error('storage function error', e);
    return json({ error: String(e) }, { status: 500 });
  }
});


