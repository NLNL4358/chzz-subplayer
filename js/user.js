const clientId = "_hmVVnvtB0bPAc6HaaZz";  // 네이버에서 발급받은 클라이언트 ID

/**
 * 네이버 개발자 설정!!
 * 
 * 확장프로그램의 ID가 있다 pbdbeakfknimebmfgmflffaabppbfbmn 라고했을 경우
 * 
 * 서비스 URL은 리디렉션 URI에서 경로(/provider_cb)를 제외한 도메인 부분이므로
 *      https://pbdbeakfknimebmfgmflffaabppbfbmn.chromiumapp.org
 * 콜백 URL은 리디렉션 URI와 정확히 일치해야 하므로
 *      https://pbdbeakfknimebmfgmflffaabppbfbmn.chromiumapp.org/provider_cb
 */

const redirectURI = `https://pbdbeakfknimebmfgmflffaabppbfbmn.chromiumapp.org/provider_cb`;  // 서비스 URL로 확장프로그램의 ID : pbdbeakfknimebmfgmflffaabppbfbmn 를 이용하며 뒤에 .chromiumapp.org/provider_cb를 붙여야함
const supabaseFunctionURL = 'https://ykorbmtrpjhatgnhbjbp.supabase.co/functions/v1/get-naver-token';    // 로그인 시도 supabase Function 요청 URL 
const supabaseUserInfoURL = 'https://ykorbmtrpjhatgnhbjbp.supabase.co/functions/v1/get-user-info';      // 유저정보 가저오는 supabase Function 요청 URL


loginButton.addEventListener("click", function () {
    chrome.runtime.sendMessage({ action: 'get isLogin' }, (response) => {
        const { isLogin, userInfo } = response;
        if (isLogin) {
            /* 이미 로그인 상태면 로그아웃 */
            chrome.runtime.sendMessage({ action: 'set logout' });
            changeLoginStateTextHandler()

            return;
        }

        else {
            //로딩 팝업 띄우기
            popupManager("loading");

            const state = Math.random().toString(36).substr(2, 10); // 랜덤 상태 값 생성
            const apiURL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectURI}&state=${state}`;

            chrome.identity.launchWebAuthFlow({
                url: apiURL,
                interactive: true
            }, function (redirect_url) {
                if (chrome.runtime.lastError || redirect_url.includes('error')) {
                    console.error(chrome.runtime.lastError);
                } else {
                    const urlParams = new URLSearchParams(new URL(redirect_url).search);
                    const code = urlParams.get('code');
                    getAccessToken(code).then(accessToken => {
                        return fetchUserInfoFromSupabase(accessToken);
                    }).catch(error => console.error(error));
                }
            });
        }
    })
});

// 콜백 URL에서 코드 받고 Supabase 로그인 시도 함수로 토큰을 요청하는 코드
async function getAccessToken(code) {
    const response = await fetch(`${supabaseFunctionURL}?code=${code}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlrb3JibXRycGpoYXRnbmhiamJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU4NDg1NTMsImV4cCI6MjA0MTQyNDU1M30.BMF7MCmJIcjHmv1OTpbwSyLd23iz4FrMa1cDtQxa5dc',
        },
    });

    const data = await response.json();
    if (data.accessToken) {
        return data.accessToken;
    } else {
        throw new Error("Failed to get access token from Supabase");
    }
}

// Supabase에서 사용자 정보를 가져오는 코드
async function fetchUserInfoFromSupabase(accessToken) {
    const response = await fetch(`${supabaseUserInfoURL}?accessToken=${accessToken}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlrb3JibXRycGpoYXRnbmhiamJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNTg0ODU1MywiZXhwIjoyMDQxNDI0NTUzfQ.vzkgJHBJr4E2vTjAYjq08nbPK1Y9w0J4dLckOxJ9Udk'
        },
    });

    const profileData = await response.json();
    if (profileData.email) {
        userInfo = {
            email: profileData.email,
            nickname: profileData.nickname,
            age: profileData.age,
        };
        console.log(userInfo);

        chrome.runtime.sendMessage({ action: 'set login', userInfo: userInfo })

        changeLoginStateTextHandler()
        popupManager("");
    } else {
        console.error("Failed to fetch user info from Supabase");
    }
}