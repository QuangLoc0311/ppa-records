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
    const { action, payload } = await req.json();

    switch (action) {
      case 'getRecentMatches': {
        const limit: number = payload?.limit ?? 5;
        const { data, error } = await supabase
          .from('matches')
          .select(`*, match_players!inner(player_id, team, players(*))`)
          .order('created_at', { ascending: false })
          .limit(limit);
        if (error) throw error;
        return json({ data }, origin);
      }

      case 'getActiveMatches': {
        const { data, error } = await supabase
          .from('matches')
          .select(`*, match_players!inner(player_id, team, players(*))`)
          .is('team1_score', null)
          .is('team2_score', null)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return json({ data }, origin);
      }

      case 'createMatch': {
        const { sessionId, matchNumber, team1Player1Id, team1Player2Id, team2Player1Id, team2Player2Id } = payload as any;
        const { data: match, error: matchError } = await supabase
          .from('matches')
          .insert([{ session_id: sessionId, match_number: matchNumber, status: 'scheduled' }])
          .select()
          .single();
        if (matchError) throw matchError;
        const matchPlayers = [
          { match_id: match.id, player_id: team1Player1Id, team: 1 },
          { match_id: match.id, player_id: team1Player2Id, team: 1 },
          { match_id: match.id, player_id: team2Player1Id, team: 2 },
          { match_id: match.id, player_id: team2Player2Id, team: 2 },
        ];
        const { error: playersError } = await supabase.from('match_players').insert(matchPlayers);
        if (playersError) throw playersError;
        return json({ ok: true, id: match.id }, origin, { status: 201 });
      }

      case 'updateMatchResult': {
        const { matchId, team1Score, team2Score } = payload as any;
        const { error } = await supabase
          .from('matches')
          .update({ team1_score: team1Score, team2_score: team2Score, status: 'completed' })
          .eq('id', matchId);
        if (error) throw error;
        return json({ ok: true }, origin);
      }

      case 'getMatchById': {
        const { matchId } = payload as any;
        const { data, error } = await supabase
          .from('matches')
          .select(`*, match_players!inner(player_id, team, players(*))`)
          .eq('id', matchId)
          .single();
        if (error) throw error;
        return json({ data }, origin);
      }

      case 'getPlayerMatchHistory': {
        const { playerId } = payload as any;
        const { data, error } = await supabase
          .from('matches')
          .select(`*, match_players!inner(player_id, team, players(*))`)
          .not('team1_score', 'is', null)
          .not('team2_score', 'is', null)
          .order('created_at', { ascending: false });
        if (error) throw error;
        const filtered = (data || []).filter((m: any) => m.match_players.some((mp: any) => mp.player_id === playerId));
        return json({ data: filtered }, origin);
      }

      default:
        return json({ error: 'Unknown action' }, origin, { status: 400 });
    }
  } catch (e) {
    console.error('matches function error', e);
    return json({ error: String(e) }, origin, { status: 500 });
  }
});


