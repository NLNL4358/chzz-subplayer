/**
 * CORS 오류를 우회할 수 있는 백그라운드 스크립트
 */


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getAccessToken") {
        const tokenURL = `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${request.clientId}&client_secret=_hmVVnvtB0bPAc6HaaZz&redirect_uri=${request.redirectURI}&code=${request.code}`;

        const data = fetch(tokenURL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.access_token) {
                sendResponse({ accessToken: data.access_token });
            } else {
                sendResponse({ error: "Failed to get access token" });
            }
        })
        .catch(error => {
            console.error(error);
            sendResponse({ error: error.message });
        });

        return true; // Response를 비동기적으로 보내기 위해 true 반환
    }
});