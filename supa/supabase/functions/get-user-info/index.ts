import { serve } from "https://deno.land/std@0.140.0/http/server.ts";

serve(async (req) => {
  console.log("req 확인 : ", req);

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
  const accessToken = url.searchParams.get("accessToken");

  if (!accessToken) {
    return new Response("Code not found", { status: 400 });
  }

  try {
    // Naver API 요청을 프록시
    const profileURL = "https://openapi.naver.com/v1/nid/me";
    const profileResponse = await fetch(profileURL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const profileData = await profileResponse.json();

    if (!profileData.response) {
      return new Response("Failed to fetch user info", { status: 400 });
    }

    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    return new Response(JSON.stringify(profileData.response), {
      status: 200,
      headers,
    });
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
});
