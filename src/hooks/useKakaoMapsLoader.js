import { useEffect } from 'react'

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY
// 앱에서 쓰는 라이브러리의 합집합. services 를 포함해 받은 SDK는 포함하지 않은 것의
// 상위집합이라, 지도만 쓰는 컴포넌트도 이 하나를 그대로 공유할 수 있다.
const KAKAO_LIBRARIES = 'services'

// SDK는 앱 전체에서 한 번만 받는다. 로드가 끝난 프라미스를 모듈 수준에 들고 있다가
// 이후 호출자에게 그대로 넘겨준다(스크립트를 마운트마다 붙이면 같은 SDK를 중복으로
// 내려받고 재실행하면서 window.kakao 를 서로 덮어쓴다).
let loadPromise = null

function loadKakaoMaps() {
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&libraries=${KAKAO_LIBRARIES}&autoload=false`
    script.async = true
    script.onload = () => window.kakao.maps.load(resolve)
    script.onerror = () => {
      // 실패를 캐시하면 새로고침 전까지 지도가 영영 안 뜬다. 다음 마운트에서
      // 다시 시도할 수 있도록 스크립트와 프라미스를 모두 되돌린다.
      script.remove()
      loadPromise = null
      reject(new Error('카카오맵 SDK를 불러오지 못했습니다.'))
    }
    document.head.appendChild(script)
  })

  return loadPromise
}

// 카카오맵 SDK 로드가 끝나면 onReady를 한 번 호출한다.
// enabled: 아직 지도를 그릴 데이터가 없으면 로드를 시작하지 않는다.
// deps: 이 배열이 바뀔 때만 onReady를 다시 호출한다(좌표를 JSON.stringify한 값 등을 넣어
// 참조가 바뀌어도 내용이 같으면 지도를 다시 만들지 않게 하는 용도).
export function useKakaoMapsLoader(onReady, deps, { enabled = true } = {}) {
  useEffect(() => {
    if (!KAKAO_JS_KEY || !enabled) return

    // 로드가 끝나기 전에 언마운트되면 컨테이너 ref가 null이라 지도를 만들다 에러가 난다.
    let isCancelled = false

    loadKakaoMaps()
      .then(() => {
        if (isCancelled) return
        onReady()
      })
      // 로드 실패는 여기서 삼킨다(화면 안내는 아직 없다). 그냥 두면 처리되지 않은
      // 프라미스 거부로 콘솔에 그대로 찍힌다.
      .catch(() => {})

    return () => {
      isCancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
