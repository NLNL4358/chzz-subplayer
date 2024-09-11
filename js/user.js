/* local 정보로 남겨야할 요소
    1. 로그인 상태
    2. 유저 정보
*/

let inLogin = false;
let userInfo = {};

const clientId = "_hmVVnvtB0bPAc6HaaZz";  // 네이버에서 발급받은 클라이언트 ID
const redirectURI = `https://kinjokladgibkhadlkbnhkobkgokdfee.chromiumapp.org/provider_cb`;  // 네이버에서 설정한 콜백 URL
const supabaseFunctionURL = 'https://ykorbmtrpjhatgnhbjbp.supabase.co/functions/v1/get-naver-token';

document.querySelector(".loginButton").addEventListener("click", function () {
    const state = Math.random().toString(36).substr(2, 10); // 랜덤 상태 값 생성
    const apiURL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectURI}&state=${state}`;

    chrome.identity.launchWebAuthFlow({
        url: apiURL,
        interactive: true
    }, function(redirect_url) {
        if (chrome.runtime.lastError || redirect_url.includes('error')) {
            console.error(chrome.runtime.lastError);
        } else {
            const urlParams = new URLSearchParams(new URL(redirect_url).search);
            const code = urlParams.get('code');
            getAccessToken(code).then(accessToken => {
                return getUserInfo(accessToken);
            }).catch(error => console.error(error));
        }
    });
});

// 콜백 URL에서 코드 받고 Supabase 함수로 토큰을 요청하는 코드
async function getAccessToken(code) {
    const response = await fetch(`${supabaseFunctionURL}?code=${code}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlrb3JibXRycGpoYXRnbmhiamJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU4NDg1NTMsImV4cCI6MjA0MTQyNDU1M30.BMF7MCmJIcjHmv1OTpbwSyLd23iz4FrMa1cDtQxa5dc',
        },
    });

    const data = await response.json();
    if (data.accessToken) {
        return data.accessToken;
    } else {
        throw new Error("Failed to get access token from Supabase");
    }
}

// 사용자 정보 요청
async function getUserInfo(accessToken) {
    const profileURL = "https://openapi.naver.com/v1/nid/me";
    const response = await fetch(profileURL, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    const profileData = await response.json();
    if (profileData.response) {
        userInfo = {
            email: profileData.response.email,
            nickname: profileData.response.nickname,
            age: profileData.response.age,
        };

        document.getElementById("userNameHead").innerText = userInfo.nickname;
        document.getElementById("userNameTail").innerText = userInfo.email; // Email 또는 다른 정보 표시
        inLogin = true;

        console.log(inLogin);
        console.log(userInfo);
    }
}