function makeYoutubeURL(videoId, startTime) {
  return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&start=${startTime}&controls=0&mute=1&playsinline=1&loop=1&playlist=${videoId}`
}

function createYouTubePlayer(videoId, startTime) {
  const iframe = document.createElement('iframe');
  iframe.src = makeYoutubeURL(videoId, startTime);
  iframe.width = '270';
  iframe.height = '151.875';
  iframe.frameBorder = '0';
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
  iframe.allowFullscreen = true;
  document.getElementById('player').innerHTML = ''; // Clear previous player
  document.getElementById('player').appendChild(iframe);
}

// 유튜브 API가 메시지를 받았을 때 핸들링하기 위한 함수
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://www.youtube.com') return;

  const data = JSON.parse(event.data);

  if (data.event === 'onReady') {
      console.log('YouTube player is ready');
      // 여기서 필요한 초기화나 추가적인 명령을 넣을 수 있습니다.
  } else if (data.event === 'onStateChange') {
      console.log('Player state changed:', data);
  }
});

// 확장 프로그램에서 브라우저의 현재 탭에 스크립트를 삽입
function cloneIframeToBrowser() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: insertIframeToPage,
      args: [makeYoutubeURL('M7lc1UVf-VE', 440)], 
    });
  });
}

// 브라우저 웹페이지에 iframe을 추가하는 함수
function insertIframeToPage(src) {
  const existingWrap = document.querySelector('div#cloned-wrap');
  if (!existingWrap) {
    const wrap = document.createElement('div');
    wrap.id = 'cloned-wrap';
    wrap.style.position = 'fixed';
    wrap.style.bottom = '10px';
    wrap.style.right = '10px';
    wrap.style.zIndex = '1000';
    wrap.style.width = '300px'; // 초기 너비
    wrap.style.height = '169px'; // 초기 높이 (16:9 비율)
    wrap.style.overflow = 'hidden';
    wrap.style.border = 'none';
    wrap.style.borderRadius = '5px';
    wrap.style.padding = '10px';
    wrap.style.background = 'rgba(0, 0, 0, 0.3)'; // 배경색 및 불투명도
    wrap.style.backdropFilter = 'blur(5px)'; // 블러 효과
    wrap.style.cursor = 'move';
    wrap.style.userSelect = 'none'; // 드래그 방지
    
    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.id = 'cloned-iframe';
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.frameBorder = '0';
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.style.pointerEvents = 'none'; // 클릭 이벤트 차단
    iframe.style.userSelect = 'none';

    wrap.appendChild(iframe);
    document.body.appendChild(wrap);

    // 드래그와 리사이즈 기능 정의
    makeDraggable(wrap);
    makeResizable(wrap);
  } else {
    console.log('Wrap already exists on the page.');
  }

  // 드래그 가능하게 하는 함수
  function makeDraggable(element) {
    let offsetX, offsetY, isDragging = false;

    element.addEventListener('mousedown', (event) => {
      if (event.target === element) { // wrap 본체를 클릭했을 때만 드래그 시작
        isDragging = true;
        offsetX = event.clientX - element.getBoundingClientRect().left;
        offsetY = event.clientY - element.getBoundingClientRect().top;
        document.addEventListener('mousemove', mouseMove);
        document.addEventListener('mouseup', mouseUp);
      }
    });

    function mouseMove(event) {
      if (isDragging) {
        element.style.left = `${event.clientX - offsetX}px`;
        element.style.top = `${event.clientY - offsetY}px`;
      }
    }

    function mouseUp() {
      isDragging = false;
      document.removeEventListener('mousemove', mouseMove);
      document.removeEventListener('mouseup', mouseUp);
    }
  }

  // 크기 조정 가능하게 하는 함수
  function makeResizable(element) {
    const resizer = document.createElement('div');
    resizer.style.width = '0';
    resizer.style.height = '0';
    resizer.style.borderLeft = '5px solid transparent';
    resizer.style.borderRight = '5px solid transparent';
    resizer.style.borderTop = '5px solid #fff'; // 화살표 색상
    resizer.style.transform = 'rotate(315deg)';
    resizer.style.position = 'absolute';
    resizer.style.right = '0px';
    resizer.style.bottom = '2px';
    resizer.style.cursor = 'nwse-resize';

    element.appendChild(resizer);

    let isResizing = false; // Resize 상태를 추적하는 플래그

    resizer.addEventListener('mousedown', (event) => {
      event.preventDefault();
      isResizing = true; // 리사이징 시작
      document.addEventListener('mousemove', resize);
      document.addEventListener('mouseup', stopResize);
    });

    function resize(event) {
      if (!isResizing) return; // 리사이징 중이 아닐 경우 함수 종료

      const newWidth = event.clientX - element.getBoundingClientRect().left;
      const newHeight = newWidth * (9 / 16); // 16:9 비율 유지
      element.style.width = `${newWidth}px`;
      element.style.height = `${newHeight}px`;
    }

    function stopResize() {
      isResizing = false; // 리사이징 종료
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResize);
    }

    element.addEventListener('mouseup', stopResize);
  }
}


// iframe 내부의 비디오 요소를 가져오는 함수
async function getVideoFromIframe(iframe) {
    return new Promise((resolve) => {
      try {
          // iframe의 contentWindow에 접근하여 video 요소를 찾습니다.
          const video = iframe.contentWindow.document.querySelector('video');
          if (video) {
              clearInterval(interval);
              resolve(video);
          }
      } catch (error) {
          // Cross-origin 접근으로 인해 오류 발생할 수 있습니다.
          console.warn('Could not access iframe content:', error);
      }
    });
}


// PiP 버튼을 클릭하면 활성화
document.querySelector('.pipButton').addEventListener('click', () => {cloneIframeToBrowser()});


// 사용 예제
createYouTubePlayer('M7lc1UVf-VE', 440); // 영상 ID와 시작 시간을 설정 (440초 -> 7분 20초)
