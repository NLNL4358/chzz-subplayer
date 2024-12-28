import { serve } from "https://deno.land/std@0.140.0/http/server.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    const headers = new Headers();
    headers.set("Access-Control-Allow-Origin", "*"); // 모든 도메인 허용
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS"); // 허용할 HTTP 메서드
    headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization" // Authorization 추가
    );
    return new Response(null, { headers });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const { accessToken } = await req.json(); // 프론트에서 전달한 access_token 받기

  if (!accessToken) {
    return new Response(JSON.stringify({ error: "Access token is missing" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const clientId = "_hmVVnvtB0bPAc6HaaZz"; // 네이버 애플리케이션 client_id
  const clientSecret = "I_xHTZ_yWN"; // 네이버 애플리케이션 client_secret

  const logoutURL = `https://nid.naver.com/oauth2.0/token?grant_type=delete&client_id=${clientId}&client_secret=${clientSecret}&access_token=${accessToken}&service_provider=NAVER`;

  try {
    const logoutResponse = await fetch(logoutURL, {
      method: "GET",
    });

    if (logoutResponse.ok) {
      const headers = new Headers();
      headers.set("Access-Control-Allow-Origin", "*");
      headers.set("Content-Type", "application/json");

      return new Response(
        JSON.stringify({ message: "Logged out successfully" }),
        { status: 200, headers }
      );
    } else {
      const errorData = await logoutResponse.json();
      return new Response(
        JSON.stringify({ error: "Logout failed", details: errorData }),
        {
          status: logoutResponse.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
