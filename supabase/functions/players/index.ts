// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { getSupabaseClient } from "../_shared/supabaseClient.ts";
import { handleOptions, json } from "../_shared/cors.ts";

type Gender = 'male' | 'female';
interface UpdatePlayerData {
  name?: string;
  avatar_url?: string;
  gender?: Gender;
  score?: number;
}

const supabase = getSupabaseClient();

serve(async (req: Request) => {
  try {
    const origin = req.headers.get("origin");
    
    if (req.method === "OPTIONS") {
      return handleOptions(origin);
    }

    const { action, payload } = await req.json();

    switch (action) {
      case 'getPlayers': {
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .order('name', { ascending: true });
        if (error) throw error;
        return json({ data }, origin);
      }

      case 'getPlayersByScore': {
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .order('score', { ascending: false });
        if (error) throw error;
        return json({ data }, origin);
      }

      case 'createPlayer': {
        const { name, avatar_url, gender, score } = payload as { name: string; avatar_url?: string; gender: Gender; score: number };
        const { data, error } = await supabase
          .from('players')
          .insert([{ name, avatar_url: avatar_url || '', gender, score }])
          .select()
          .single();
        if (error) throw error;
        return json({ data }, origin, { status: 201 });
      }

      case 'deletePlayer': {
        const { playerId } = payload as { playerId: string };
        const { error } = await supabase
          .from('players')
          .delete()
          .eq('id', playerId);
        if (error) throw error;
        return json({ ok: true }, origin);
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
        return json({ ok: true, score: newScore }, origin);
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
        return json({ data }, origin);
      }

      case 'getPlayerById': {
        const { playerId } = payload as { playerId: string };
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .eq('id', playerId)
          .single();
        if (error) throw error;
        return json({ data }, origin);
      }

      default:
        return json({ error: 'Unknown action' }, origin, { status: 400 });
    }
  } catch (error) {
    console.error('players function error', error);
    return json({ error: String(error) }, origin, { status: 500 });
  }
});


