import MapStatus from './MapStatus'
import { useRef } from 'react'
import { useKakaoMapsLoader } from '../../hooks/useKakaoMapsLoader'
import { useKakaoMapResize } from '../../hooks/useKakaoMapResize'
import { createPinContent } from '../../utils/mapMarker'

// 중간지점 좌표 하나를 지도에 핀+라벨로 찍어서 보여주는 표시용 컴포넌트
// 지도가 이 화면의 주인공이라 기본 높이를 크게 잡는다(예전 240px 은 답답했다).
function MidpointMap({ name, lat, lng, height = 380 }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const overlayRef = useRef(null)

  useKakaoMapResize(containerRef, mapRef)

  const { isLoading, error } = useKakaoMapsLoader(
    () => {
      const center = new window.kakao.maps.LatLng(lat, lng)

      // 좌표가 바뀔 때마다 같은 컨테이너에 지도를 새로 만들면 이전 지도가 정리되지 않고
      // 그대로 쌓인다. 한 번만 만들고 이후에는 위치만 옮긴다.
      if (!mapRef.current) {
        mapRef.current = new window.kakao.maps.Map(containerRef.current, { center, level: 5 })
      } else {
        mapRef.current.setCenter(center)
      }

      // 핀과 라벨을 한 덩어리로 그린다. 기본 마커를 따로 쓰면 라벨과 따로 놀아
      // 위치가 어긋나 보이고, 색도 앱과 맞지 않는다.
      if (overlayRef.current) {
        overlayRef.current.setPosition(center)
        overlayRef.current.setContent(createPinContent({ label: name }))
      } else {
        overlayRef.current = new window.kakao.maps.CustomOverlay({
          position: center,
          map: mapRef.current,
          // 아래 끝(핀 끝)이 좌표에 오도록 한다.
          yAnchor: 1,
          content: createPinContent({ label: name }),
        })
      }
    },
    [lat, lng, name],
    { enabled: lat != null && lng != null }
  )

  return (
    <>
      <MapStatus isLoading={isLoading} error={error} />
    <div
      ref={containerRef}
      className="w-full overflow-hidden rounded-card border border-edge shadow-surface"
      style={{ height }}
    />
    </>
  )
}

export default MidpointMap
