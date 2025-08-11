// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, serviceRoleKey);

function json(data: any, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

function verifyToken(req: Request): string | null {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  // TODO: Implement proper JWT verification
  // For now, we'll use a simple approach
  return 'user-id'; // This should be extracted from the JWT token
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200 });
  }

  try {
    const userId = verifyToken(req);
    if (!userId) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, payload } = await req.json();

    switch (action) {
      case 'getGroups': {
        const { data: groups, error } = await supabase
          .from('groups')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return json({ data: groups || [] });
      }

      case 'createGroup': {
        const { name, description } = payload;
        
        const { data: group, error } = await supabase
          .from('groups')
          .insert([{
            name,
            description,
            user_id: userId
          }])
          .select()
          .single();

        if (error) throw error;
        return json({ data: group });
      }

      case 'updateGroup': {
        const { groupId, updates } = payload;
        
        const { data: group, error } = await supabase
          .from('groups')
          .update(updates)
          .eq('id', groupId)
          .eq('user_id', userId) // Ensure user owns the group
          .select()
          .single();

        if (error) throw error;
        return json({ data: group });
      }

      case 'deleteGroup': {
        const { groupId } = payload;
        
        const { error } = await supabase
          .from('groups')
          .delete()
          .eq('id', groupId)
          .eq('user_id', userId); // Ensure user owns the group

        if (error) throw error;
        return json({ success: true });
      }

      default:
        return json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Groups function error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
});