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
      case 'getSessions': {
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return json({ data }, origin);
      }

      case 'getSessionById': {
        const { sessionId } = payload as any;
        const { data: session, error: sessionError } = await supabase
          .from('sessions')
          .select('*')
          .eq('id', sessionId)
          .single();
        if (sessionError) throw sessionError;
        const { data: matches, error: matchesError } = await supabase
          .from('matches')
          .select(`*, match_players(*, players(*))`)
          .eq('session_id', sessionId)
          .order('match_number', { ascending: true });
        if (matchesError) throw matchesError;
        return json({ session, matches }, origin);
      }

      case 'createSession': {
        const { name, sessionDurationMinutes, matchDurationMinutes, matches } = payload as any;
        const { data: session, error: sessionError } = await supabase
          .from('sessions')
          .insert([{ name, session_duration_minutes: sessionDurationMinutes, match_duration_minutes: matchDurationMinutes, status: 'draft' }])
          .select()
          .single();
        if (sessionError) throw sessionError;
        const matchInserts = matches.map((_m: any, idx: number) => ({ session_id: session.id, match_number: idx + 1, status: 'scheduled' }));
        const { data: insertedMatches, error: matchesError } = await supabase.from('matches').insert(matchInserts).select();
        if (matchesError) throw matchesError;
        const matchPlayerInserts: any[] = [];
        for (let i = 0; i < matches.length; i++) {
          const match = matches[i];
          const matchId = insertedMatches[i].id;
          matchPlayerInserts.push({ match_id: matchId, player_id: match.team1.player1.id, team: 1 });
          matchPlayerInserts.push({ match_id: matchId, player_id: match.team1.player2.id, team: 1 });
          matchPlayerInserts.push({ match_id: matchId, player_id: match.team2.player1.id, team: 2 });
          matchPlayerInserts.push({ match_id: matchId, player_id: match.team2.player2.id, team: 2 });
        }
        const { error: mpError } = await supabase.from('match_players').insert(matchPlayerInserts);
        if (mpError) throw mpError;
        return json({ data: session }, origin, { status: 201 });
      }

      case 'updateSessionStatus': {
        const { sessionId, status } = payload as any;
        const { error } = await supabase
          .from('sessions')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', sessionId);
        if (error) throw error;
        return json({ ok: true }, origin);
      }

      case 'deleteSession': {
        const { sessionId } = payload as any;
        const { error } = await supabase.from('sessions').delete().eq('id', sessionId);
        if (error) throw error;
        return json({ ok: true }, origin);
      }

      default:
        return json({ error: 'Unknown action' }, origin, { status: 400 });
    }
  } catch (e) {
    console.error('sessions function error', e);
    return json({ error: String(e) }, origin, { status: 500 });
  }
});


