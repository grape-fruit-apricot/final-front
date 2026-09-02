import { useRef } from 'react'
import { useKakaoMapsLoader } from '../../hooks/useKakaoMapsLoader'

// 중간지점 좌표 하나를 지도에 마커+라벨로만 찍어서 보여주는 표시용 컴포넌트
function MidpointMap({ name, lat, lng, height = 240 }) {
  const containerRef = useRef(null)

  useKakaoMapsLoader(
    () => {
      const center = new window.kakao.maps.LatLng(lat, lng)
      const map = new window.kakao.maps.Map(containerRef.current, { center, level: 5 })

      new window.kakao.maps.Marker({ position: center, map })
      new window.kakao.maps.CustomOverlay({
        position: center,
        map,
        yAnchor: 1.8,
        content: `<div style="background:var(--color-main-navy);color:#fff;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:600;white-space:nowrap;">${name}</div>`,
      })
    },
    [lat, lng, name],
    { enabled: lat != null && lng != null }
  )

  return <div ref={containerRef} className="w-full rounded-lg" style={{ height }} />
}

export default MidpointMap
