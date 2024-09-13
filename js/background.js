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
 * background.js 에서 변수를 popup이 가져갈땐 Promise 형태로 주기때문에 .then을 이용해야한다.
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
            break;
        case 'set logout':
            isLogin = false;
            userInfo = {};
            break;
        default:
            console.error('Unknown action:', message.action);
    }
});