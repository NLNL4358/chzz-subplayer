/**
 * !! background.js 에서는 어떤게 있어야하나? 
 * background.js 에서는 팝업이 닫혀도 상태를 유지하도록 하여야함
 * 저장 되어 있어야할 변수 : isLogin, userInfo 등이 저장되어야함
 * 이벤트 리스너 : chrome.runtime.onMessage 와 가트은 이벤트 리스너를 통해 메세지를 처리, 상태를 관리함
 * 
 * 
 * background.js 에서 선한된 변수를 popup(user.js, handler.js)에서 조작하려면 일반적인 방법으론 불가능!! 
 * ㄴ => 메세지 기반 통신을 통해 변경해야한다.
 * 
 * !!! background.js 에서 변수를 popup이 가져갈땐 Promise 형태로 주기때문에 .then을 이용해야한다.
 * 
 * 
 * Chrome의 서비스워커가 자꾸 비활성 상태일때 이 스크립트를 끄게되기 때문에 이를 방지하기위해 chrome.storage를 이용하여야 한다.
 */



/* === 변수 === */
/**
 * @param isLogin : 로그인 상태
 * @param userInfo : 로그인 한 유저의 정보
 * @param mode : 사용자의 모드를 설정합니다. false : 시청자 / true : 스트리머
 */
let isLogin = false;
let userInfo = {};
let mode = false;

// 서비스 워커가 시작될 때 저장된 상태를 불러옴
chrome.storage.local.get(['isLogin', 'userInfo', 'mode'], (result) => {
    isLogin = result.isLogin ?? false;
    userInfo = result.userInfo ?? {};
    mode = result.mode ?? false;
});

/* === 메세지 리스너 === */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    switch (message.action) {
            /* === 요청 === */
        case 'get isLogin':
            sendResponse({isLogin, userInfo});
            break;
        case 'get mode':
            sendResponse(mode);
            break;

            /* === 수정 === */
        case 'set login':
            isLogin = true;
            userInfo = message.userInfo;
            saveState();
            break;
        case 'set logout':
            isLogin = false;
            userInfo = {};
            saveState();
            break;

        case 'set mode':
            mode = !mode;
            sendResponse(mode);
            saveState();
            break
        
        default:
            console.error('Unknown action:', message.action);
    }
});


// 상태를 chrome.storage.local에 저장하는 함수
function saveState() {
    chrome.storage.local.set({ isLogin, userInfo, mode });
}