// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHash } from "https://deno.land/std@0.177.0/hash/mod.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, serviceRoleKey);

// JWT secret (you should set this in environment variables)
const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'your-secret-key-change-this';

function json(data: any, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateToken(userId: string): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = { 
    sub: userId, 
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
  };
  
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  
  const signature = createHash('sha256')
    .update(`${encodedHeader}.${encodedPayload}.${JWT_SECRET}`)
    .toString('hex');
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyToken(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [encodedHeader, encodedPayload, signature] = parts;
    
    // Verify signature
    const expectedSignature = createHash('sha256')
      .update(`${encodedHeader}.${encodedPayload}.${JWT_SECRET}`)
      .toString('hex');
    
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200 });
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

        // TODO: Send email with code (you'll need to implement this)
        // For now, just log it
        console.log(`Verification code for ${email}: ${code}`);

        return json({ success: true });
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
          return json({ error: 'Invalid or expired code' }, { status: 400 });
        }

        // Get user
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (userError) throw userError;

        // Generate JWT token
        const token = generateToken(user.id);

        // Delete used code
        await supabase
          .from('verification_codes')
          .delete()
          .eq('id', verificationCode.id);

        return json({
          user,
          token
        });
      }

      case 'getCurrentUser': {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return json({ error: 'Missing authorization header' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const userId = verifyToken(token);
        
        if (!userId) {
          return json({ error: 'Invalid or expired token' }, { status: 401 });
        }

        // Get user data
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (userError) throw userError;

        return json({ user });
      }

      default:
        return json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Auth function error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
});