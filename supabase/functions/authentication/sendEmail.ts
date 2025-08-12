export async function sendEmail(to: string, subject: string, html: string) {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      throw new Error("Missing RESEND_API_KEY in environment");
    }
  
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "PPA Records Verification Code <onboarding@resend.dev>", // Can be default Resend domain or your verified one
        to: [to],
        subject,
        html,
      }),
    });
  
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to send email: ${errorText}`);
    }
  
    return await res.json();
  }