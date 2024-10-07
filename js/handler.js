/**
 * ---- user.js 에서 이어지는 변수 ----
 * isLogin : 로그인 되었는지 아닌지 boolean
 * userInfo : 유저 정보 객체 {
 *  age : 나이 <- 필요없을듯?
 *  email : 이메일 주소
 *  nickname : 네이버 닉네임
 * }
 * ----
 */


/* Function */

/**
 * @function changeLoginStateTextHandler :  로그인 상태에 따라 텍스트 변경하는 함수 
 * @case_login 로그인으로 변경된 경우
 * @case_logout 로그아웃으로 변경된 경우
 */
const changeLoginStateTextHandler = async () => {
    chrome.runtime.sendMessage({action : 'get isLogin'}, (response) => {
        const {isLogin, userInfo} = response;
        console.log(isLogin, userInfo)
        switch(isLogin){
            case true :
                loginButton.innerText = "로그아웃"
                userNameHead.innerText = userInfo.nickname
                userNameTail.innerText = "님"
                return
            case false :
                loginButton.innerText = "로그인"
                userNameHead.innerText = ""
                userNameTail.innerText = "비로그인 상태"
                return
            default : 
                loginButton.innerText = "로그아웃"
                userNameHead.innerText = userInfo.nickname
                userNameTail.innerText = "님"
                return
        }
    });
}

const changeModeStateHandler = async () => {
    chrome.runtime.sendMessage({action : 'get mode'}, (response) => {
        console.log(response)
        modeChanger(response);
    });
}

const modeChanger = (status) => {
    switch(status){
        case true : 
            streamerSwitch.classList.add("on")
            inputInner[0].classList.remove("on")
            inputInner[1].classList.add("on")
            break;
        case false :
            streamerSwitch.classList.remove("on")
            inputInner[0].classList.add("on")
            inputInner[1].classList.remove("on")
            break;
    }   
}

/**
 * 팝업관리자 함수
 * @param {*} status : status에 따라서 동작을 switch, case로 다르게 동작
 * @returns 
 */
const popupManager = (status) => {
    document.querySelectorAll(".popup").forEach(item => item.classList.remove("on"))
    switch(status){
        case "loading" :
            document.querySelector(".loadingPopup").classList.add("on")
            return
        case "logout" :
            document.querySelector(".logoutPopup").classList.add("on")
        default :
            return
    }
}

/* Event-Handler */
streamerSwitch.addEventListener("click", () => {
    chrome.runtime.sendMessage({action: 'set mode'}).then(response => {
        modeChanger(response)
    });
})


