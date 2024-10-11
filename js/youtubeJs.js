function createYouTubePlayer(videoId, startTime) {
    const iframe = document.createElement('iframe');
    // iframe.setAttribute("id", "youtubeIframe");
    iframe.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&start=${startTime}&controls=0&mute=1&playsinline=1&loop=1&playlist=${videoId}`;
    iframe.width = '270';
    iframe.height = '136';
    iframe.frameBorder = '0';
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
    iframe.allowFullscreen = true;
    const scriptText = `
        <script>
            console.log("iframe script");
            window.addEventListener('message', (event) => {
                if (event.data.type === 'CONTROL_VIDEO') {
                    const video = document.getElementById('myVideo');
                    if (event.data.action === 'play') {
                        video.play();
                    } else if (event.data.action === 'pause') {
                        video.pause();
                    }
                }
            });
        </script>
    `
    iframe.append(scriptText)

    const playerDiv = document.getElementById('player');
    playerDiv.innerHTML = ''; // 이전 플레이어 제거
    playerDiv.appendChild(iframe);
}

// 사용 예제
createYouTubePlayer('M7lc1UVf-VE', 440); // 영상 ID와 시작 시간을 설정 (440초 -> 7분 20초)

// Picture-in-Picture 모드를 요청하는 함수
const enablePiP = async () =>{
    const iframe = document.querySelector('iframe');
    if (iframe) {
        iframe.requestPictureInPicture().catch(error => {
            console.error('Error enabling PiP:', error);
        });
    } else {
        console.error('Iframe not found');
    }

    //const video = findLargestPlayingVideo();
    //if (!video) {
    //    return;
    //}
    //if (video.hasAttribute('__pip__')) {
    //  document.exitPictureInPicture();
    //  return;
    //}
    //await requestPictureInPicture(video);
    //_gaq.push(['_trackPageview', '/']);
}

function findLargestPlayingVideo() {
    const iframe = document.querySelector('iframe');
    const videos = Array.from(document.querySelectorAll('video'))
      .filter(video => video.readyState != 0)
      .filter(video => video.disablePictureInPicture == false)
      .sort((v1, v2) => {
        const v1Rect = v1.getClientRects()[0]||{width:0,height:0};
        const v2Rect = v2.getClientRects()[0]||{width:0,height:0};
        return ((v2Rect.width * v2Rect.height) - (v1Rect.width * v1Rect.height));
      });
  
    if (videos.length === 0) {
      return;
    }
  
    return videos[0];
  }
  
  async function requestPictureInPicture(video) {
    await video.requestPictureInPicture();
    video.setAttribute('__pip__', true);
    video.addEventListener('leavepictureinpicture', event => {
      video.removeAttribute('__pip__');
    }, { once: true });
    new ResizeObserver(maybeUpdatePictureInPictureVideo).observe(video);
  }
  
  function maybeUpdatePictureInPictureVideo(entries, observer) {
    const observedVideo = entries[0].target;
    if (!document.querySelector('[__pip__]')) {
      observer.unobserve(observedVideo);
      return;
    }
    const video = findLargestPlayingVideo();
    if (video && !video.hasAttribute('__pip__')) {
      observer.unobserve(observedVideo);
      requestPictureInPicture(video);
    }
  }


// PiP 버튼을 클릭하면 활성화
document.getElementById('pipButton').addEventListener('click', () => {enablePiP()});



// 예를 들어, 비디오 재생 명령을 보낼 때
// iframe.contentWindow.postMessage({ type: 'CONTROL_VIDEO', action: 'play' }, '*');

// 비디오 일시정지 명령을 보낼 때
// iframe.contentWindow.postMessage({ type: 'CONTROL_VIDEO', action: 'pause' }, '*');