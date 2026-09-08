import { useRef } from 'react'
import { useKakaoMapsLoader } from '../../hooks/useKakaoMapsLoader'

// 중간지점 좌표 하나를 지도에 마커+라벨로만 찍어서 보여주는 표시용 컴포넌트
// 지도가 이 화면의 주인공이라 기본 높이를 크게 잡는다(예전 240px 은 답답했다).
function MidpointMap({ name, lat, lng, height = 380 }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const overlayRef = useRef(null)

  useKakaoMapsLoader(
    () => {
      const center = new window.kakao.maps.LatLng(lat, lng)

      // 좌표가 바뀔 때마다 같은 컨테이너에 지도를 새로 만들면 이전 지도가 정리되지 않고
      // 그대로 쌓인다. 한 번만 만들고 이후에는 위치만 옮긴다.
      if (!mapRef.current) {
        mapRef.current = new window.kakao.maps.Map(containerRef.current, { center, level: 5 })
      } else {
        mapRef.current.setCenter(center)
      }

      if (markerRef.current) {
        markerRef.current.setPosition(center)
      } else {
        markerRef.current = new window.kakao.maps.Marker({ position: center, map: mapRef.current })
      }

      if (overlayRef.current) {
        overlayRef.current.setPosition(center)
        overlayRef.current.setContent(toLabelContent(name))
      } else {
        overlayRef.current = new window.kakao.maps.CustomOverlay({
          position: center,
          map: mapRef.current,
          yAnchor: 1.8,
          content: toLabelContent(name),
        })
      }
    },
    [lat, lng, name],
    { enabled: lat != null && lng != null }
  )

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden rounded-card border border-edge shadow-surface"
      style={{ height }}
    />
  )
}

function toLabelContent(name) {
  return `<div style="background:var(--color-app-text);color:#fff;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;white-space:nowrap;">${name}</div>`
}

export default MidpointMap
