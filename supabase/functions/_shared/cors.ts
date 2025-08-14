export const allowedOrigins = [
  "http://localhost:5173",     // Dev
  "https://ppa-records.vercel.app" // Prod
];

export function getCorsHeaders(origin: string | null) {
  const isAllowedOrigin = origin && allowedOrigins.some(o => o.startsWith(origin));
  return {
    "Access-Control-Allow-Origin": isAllowedOrigin ? origin! : allowedOrigins[0],
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, cookie",
    "Access-Control-Allow-Credentials": "true",
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

export function setSecureCookie(name: string, value: string, days: number = 30) {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  
  return `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Strict; HttpOnly; ${Deno.env.get('NODE_ENV') === 'production' ? 'Secure;' : ''}`;
}

export function clearCookie(name: string) {
  return `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; HttpOnly`;
}