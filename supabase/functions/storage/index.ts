// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { getSupabaseClient } from "../_shared/supabaseClient.ts";
import { handleOptions, json } from "../_shared/cors.ts";

const supabase = getSupabaseClient();

serve(async (req: Request) => {
  try {
    const origin = req.headers.get("origin");
    
    if (req.method === "OPTIONS") {
      return handleOptions(origin);
    }
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (action === 'getPublicUrl') {
      const { filePath } = await req.json();
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath);
      return json({ publicUrl }, origin);
    }

    // For uploads, expect multipart form-data
    if (action === 'upload') {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const folder = (formData.get('folder') as string) || 'avatars';
      if (!file) return json({ error: 'Missing file' }, origin, { status: 400 });
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
      return json({ publicUrl, filePath: fileName }, origin, { status: 201 });
    }

    if (action === 'delete') {
      const { filePath } = await req.json();
      const { error } = await supabase.storage.from('images').remove([filePath]);
      if (error) throw error;
      return json({ ok: true }, origin);
    }

    return json({ error: 'Unknown action' }, origin, { status: 400 });
  } catch (e) {
    console.error('storage function error', e);
    return json({ error: String(e) }, origin, { status: 500 });
  }
});


