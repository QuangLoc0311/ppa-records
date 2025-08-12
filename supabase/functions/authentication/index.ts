// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { getSupabaseClient } from "../_shared/supabaseClient.ts";
import { handleOptions, json } from "../_shared/cors.ts";
import { sendEmail } from "./sendEmail.ts";

const supabase = getSupabaseClient();

// JWT secret (you should set this in environment variables)
const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'your-secret-key-change-this';

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function generateToken(userId: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = { 
    sub: userId, 
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
  };
  
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  
  // Use Web Crypto API for SHA-256
  const encoder = new TextEncoder();
  const data = encoder.encode(`${encodedHeader}.${encodedPayload}.${JWT_SECRET}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

async function verifyToken(token: string): Promise<string | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [encodedHeader, encodedPayload, signature] = parts;
    
    // Verify signature using Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(`${encodedHeader}.${encodedPayload}.${JWT_SECRET}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const expectedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    if (signature !== expectedSignature) return null;
    
    // Decode payload
    const payload = JSON.parse(atob(encodedPayload));
    
    // Check expiration
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    
    return payload.sub;
  } catch {
    return null;
  }
}

serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  
  if (req.method === "OPTIONS") {
    return handleOptions(origin);
  }

  try {
    const { action, payload } = await req.json();

    switch (action) {
      case 'requestCode': {
        const { email } = payload;
        
        // Check if user exists
        let { data: user } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        // Create user if doesn't exist
        if (!user) {
          const username = email.split('@')[0];
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert([{
              username,
              email,
              display_name: username
            }])
            .select()
            .single();

          if (createError) throw createError;
          user = newUser;
        }

        // Generate verification code
        const code = generateCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store verification code
        const { error: codeError } = await supabase
          .from('verification_codes')
          .insert([{
            email,
            code,
            expires_at: expiresAt.toISOString()
          }]);

        if (codeError) throw codeError;

        try {
          await sendEmail(
            email,
            "Your Verification Code",
            `<p>Your verification code is:</p>
            <h2>${code}</h2>  
            <p>This code will expire in 10 minutes.</p>`
          );
        } catch (error) {
          console.error('Failed to send email:', error);
        }

        return json({ success: true }, origin);
      }

      case 'verifyCode': {
        const { email, code } = payload;

        // Check if code is valid and not expired
        const { data: verificationCode, error: codeError } = await supabase
          .from('verification_codes')
          .select('*')
          .eq('email', email)
          .eq('code', code)
          .gt('expires_at', new Date().toISOString())
          .single();

        if (codeError || !verificationCode) {
          return json({ error: 'Invalid or expired code' }, origin, { status: 400 });
        }

        // Get user
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (userError) throw userError;

        // Generate JWT token
        const token = await generateToken(user.id);

        // Delete used code
        await supabase
          .from('verification_codes')
          .delete()
          .eq('id', verificationCode.id);

        return json({
          user,
          token
        }, origin);
      }

      case 'getCurrentUser': {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return json({ error: 'Missing authorization header' }, origin, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const userId = await verifyToken(token);
        
        if (!userId) {
          return json({ error: 'Invalid or expired token' }, origin, { status: 401 });
        }

        // Get user data
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (userError) throw userError;

        return json({ user }, origin);
      }

      default:
        return json({ error: 'Unknown action' }, origin, { status: 400 });
    }
  } catch (error) {
    console.error('Auth function error:', error);
    return json({ error: 'Internal server error' }, origin, { status: 500 });
  }
});