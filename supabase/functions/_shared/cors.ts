export const allowedOrigins = [
  "http://localhost:5173",     // Dev
  "https://ppa-records.vercel.app" // Prod
];

export function getCorsHeaders(origin: string | null) {
  const isAllowedOrigin = origin && allowedOrigins.some(o => o.startsWith(origin));
  return {
    "Access-Control-Allow-Origin": isAllowedOrigin ? origin! : allowedOrigins[0],
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

export function handleOptions(origin: string | null) {
  return new Response(null, {
    status: 200,
    headers: getCorsHeaders(origin),
  });
}

export function json(data: any, origin: string | null, init?: ResponseInit) {
  const corsHeaders = getCorsHeaders(origin);
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    ...init,
  });
}