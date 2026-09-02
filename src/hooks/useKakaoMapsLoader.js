import { useEffect } from 'react'

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY

// 카카오맵 JS SDK를 <script> 태그로 로드하고, 로드가 끝나면 onReady를 한 번 호출한다.
// enabled: 아직 지도를 그릴 데이터가 없으면 스크립트 자체를 안 붙이게 한다.
// deps: 이 배열이 바뀔 때만 스크립트를 다시 로드한다(좌표를 JSON.stringify한 값 등을 넣어
// 참조가 바뀌어도 내용이 같으면 지도를 다시 만들지 않게 하는 용도).
export function useKakaoMapsLoader(onReady, deps, { libraries, enabled = true } = {}) {
  useEffect(() => {
    if (!KAKAO_JS_KEY || !enabled) return

    const script = document.createElement('script')
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}${
      libraries ? `&libraries=${libraries}` : ''
    }&autoload=false`
    script.async = true
    script.onload = () => {
      window.kakao.maps.load(onReady)
    }
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
