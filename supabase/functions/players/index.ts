// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Gender = 'male' | 'female';

interface UpdatePlayerData {
  name?: string;
  avatar_url?: string;
  gender?: Gender;
  score?: number;
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

function json(data: any, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

serve(async (req: Request) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
    }

    const { action, payload } = await req.json();

    switch (action) {
      case 'getPlayers': {
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .order('name', { ascending: true });
        if (error) throw error;
        return json({ data });
      }

      case 'getPlayersByScore': {
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .order('score', { ascending: false });
        if (error) throw error;
        return json({ data });
      }

      case 'createPlayer': {
        const { name, avatar_url, gender, score } = payload as { name: string; avatar_url?: string; gender: Gender; score: number };
        const { data, error } = await supabase
          .from('players')
          .insert([{ name, avatar_url: avatar_url || '', gender, score }])
          .select()
          .single();
        if (error) throw error;
        return json({ data }, { status: 201 });
      }

      case 'deletePlayer': {
        const { playerId } = payload as { playerId: string };
        const { error } = await supabase
          .from('players')
          .delete()
          .eq('id', playerId);
        if (error) throw error;
        return json({ ok: true });
      }

      case 'updatePlayerScore': {
        const { playerId, scoreChange } = payload as { playerId: string; scoreChange: number };
        const { data: currentPlayer, error: fetchError } = await supabase
          .from('players')
          .select('score')
          .eq('id', playerId)
          .single();
        if (fetchError) throw fetchError;
        const current = (currentPlayer?.score ?? 5.0) as number;
        const newScore = Math.max(Math.min(current + scoreChange, 10.0), 0.0);
        const { error } = await supabase
          .from('players')
          .update({ score: newScore })
          .eq('id', playerId);
        if (error) throw error;
        return json({ ok: true, score: newScore });
      }

      case 'updatePlayer': {
        const { playerId, updates } = payload as { playerId: string; updates: UpdatePlayerData };
        const { data, error } = await supabase
          .from('players')
          .update(updates)
          .eq('id', playerId)
          .select()
          .single();
        if (error) throw error;
        return json({ data });
      }

      case 'getPlayerById': {
        const { playerId } = payload as { playerId: string };
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .eq('id', playerId)
          .single();
        if (error) throw error;
        return json({ data });
      }

      default:
        return json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('players function error', error);
    return json({ error: String(error) }, { status: 500 });
  }
});


