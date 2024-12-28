import { serve } from "https://deno.land/std@0.140.0/http/server.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    const headers = new Headers();
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return new Response(null, { headers });
  }

  // Authorization 헤더 확인
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response("Code not found", { status: 400 });
  }

  const clientId = "_hmVVnvtB0bPAc6HaaZz";
  const clientSecret = "I_xHTZ_yWN";
  const redirectURI =
    "https://ykorbmtrpjhatgnhbjbp.supabase.co/functions/v1/get-naver-token"; // Supabase Edge Function URL

  const tokenURL = `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${redirectURI}&code=${code}`;

  try {
    const tokenResponse = await fetch(tokenURL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return new Response("Failed to get access token", { status: 400 });
    }

    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("Access-Control-Allow-Origin", "*"); // CORS 허용
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    return new Response(JSON.stringify({ accessToken }), {
      status: 200,
      headers,
    });
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
});
