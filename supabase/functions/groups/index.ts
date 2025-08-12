// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { getSupabaseClient } from "../_shared/supabaseClient.ts";
import { handleOptions, json } from "../_shared/cors.ts";

const supabase = getSupabaseClient();

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
  const origin = req.headers.get("origin");
  
  if (req.method === "OPTIONS") {
    return handleOptions(origin);
  }

  try {
    const userId = verifyToken(req);
    if (!userId) {
      return json({ error: 'Unauthorized' }, origin, { status: 401 });
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
        return json({ data: groups || [] }, origin);
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
        return json({ data: group }, origin);
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
        return json({ data: group }, origin);
      }

      case 'deleteGroup': {
        const { groupId } = payload;
        
        const { error } = await supabase
          .from('groups')
          .delete()
          .eq('id', groupId)
          .eq('user_id', userId); // Ensure user owns the group

        if (error) throw error;
        return json({ success: true }, origin);
      }

      default:
        return json({ error: 'Unknown action' }, origin, { status: 400 });
    }
  } catch (error) {
    console.error('Groups function error:', error);
    return json({ error: 'Internal server error' }, origin, { status: 500 });
  }
});