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

/* DOM */
const loginButton = document.querySelector(".loginButton");
const userNameHead = document.querySelector(".userNameHead");
const userNameTail = document.querySelector(".userNameTail");

/* Function */

/**
 * @function changeLoginStateTextHandler :  로그인 상태에 따라 텍스트 변경하는 함수 
 * @case_login 로그인으로 변경된 경우
 * @case_logout 로그아웃으로 변경된 경우
 */
const changeLoginStateTextHandler = (status) => {
    switch(status){
        case "login" :
            loginButton.innerText = "로그아웃"
            userNameHead.innerText = userInfo.nickname
            userNameTail.innerText = "님"
            return
        case "logout" :
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
}


/* Event-Handler */



/* Init */



