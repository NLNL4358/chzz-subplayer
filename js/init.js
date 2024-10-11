/**
 * 확장프로그램 popup이 열릴때 UI를 업데이트하는 등의 기본상태를 업데이트하는 js입니다.
 */

document.addEventListener('DOMContentLoaded', async () => {
    await waitForBackgroundInitialization(); // background 초기화 대기
    await changeLoginStateTextHandler();
    await changeModeStateHandler();
});

// Background의 초기화가 완료될 때까지 대기하는 함수
const waitForBackgroundInitialization = () => {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'get isLogin' }, (response) => {
            if (response) {
                resolve(); // 응답이 정상적이면 초기화가 완료되었다고 간주
            } else {
                setTimeout(() => resolve(waitForBackgroundInitialization()), 100); // 재시도
            }
        });
    });
};