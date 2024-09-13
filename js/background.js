/**
 * !! background.js 에서는 어떤게 있어야하나? 
 * background.js 에서는 팝업이 닫혀도 상태를 유지하도록 하여야함
 * 저장 되어 있어야할 변수 : isLogin, userInfo 등이 저장되어야함
 * 이벤트 리스너 : chrome.runtime.onMessage 와 가트은 이벤트 리스너를 통해 메세지를 처리, 상태를 관리함
 * 
 * 
 * background.js 에서 선한된 변수를 popup(user.js, handler.js)에서 조작하려면 일반적인 방법으론 불가능!! 
 * ㄴ => 메세지 기반 통신을 통해 변경해야한다.
 */



/* === 변수 === */
let isLogin = false;
let userInfo = {};


/* === 메세지 리스너 === */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    // 로그인 정보를 요청받으면 보내준다
    if(message.action === 'getLoginState') {
        sendResponse({isLogin, userInfo})
    }

    // 로그인 햇다.
    if(message.action === 'login') {
        isLogin = true;
        userInfo = message.userInfo;        
    }

    // 로그아웃 했다.
    if(message.action === 'logout') {
        isLogin = false;
        userInfo = {}
    }
});