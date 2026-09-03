import { useEffect, useRef } from 'react'
import { useKakaoMapsLoader } from '../../hooks/useKakaoMapsLoader'

// 출발지에서 목적지까지 도보 경로 하나를 그리는 표시용 컴포넌트.
// 좌표 배열을 JSON.stringify 해서 의존성으로 거는 이유는, 참조만 바뀌고 내용이 같을 때
// 지도를 다시 만들지 않기 위해서다(확대·이동 상태가 초기화되고 자원도 낭비된다).
function RouteMap({ points, start, end, startLabel = '출발', endLabel = '도착', height = 280 }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  // 지도 위에 올린 폴리라인·마커·오버레이를 모아둔다. 다시 그리기 전과 화면을 떠날 때
  // setMap(null) 로 떼어내지 않으면 이전 것들이 지도에 그대로 쌓인다.
  const overlaysRef = useRef([])

  const hasPoints = Array.isArray(points) && points.length > 1

  useEffect(() => {
    return () => clearOverlays(overlaysRef.current)
  }, [])

  useKakaoMapsLoader(
    () => {
      const center = new window.kakao.maps.LatLng(start.lat, start.lng)

      if (!mapRef.current) {
        mapRef.current = new window.kakao.maps.Map(containerRef.current, { center, level: 5 })
      }
      const map = mapRef.current

      clearOverlays(overlaysRef.current)
      overlaysRef.current = []

      const bounds = new window.kakao.maps.LatLngBounds()

      if (hasPoints) {
        const path = points.map((point) => new window.kakao.maps.LatLng(point.lat, point.lng))
        overlaysRef.current.push(
          new window.kakao.maps.Polyline({
            map,
            path,
            strokeColor: '#F2762E',
            strokeWeight: 6,
            strokeOpacity: 0.9,
            strokeStyle: 'solid',
          })
        )
        path.forEach((latlng) => bounds.extend(latlng))
      }

      addLabeledMarker(map, overlaysRef.current, start, startLabel, '#1B2A4A')
      bounds.extend(new window.kakao.maps.LatLng(start.lat, start.lng))

      addLabeledMarker(map, overlaysRef.current, end, endLabel, '#F2762E')
      bounds.extend(new window.kakao.maps.LatLng(end.lat, end.lng))

      // 컨테이너가 막 렌더링된 시점엔 지도가 자기 크기를 몰라서, 크기를 다시 계산시킨 뒤
      // bounds 를 맞춰야 확대가 어긋나지 않는다.
      map.relayout()
      map.setBounds(bounds)
    },
    [JSON.stringify(points), JSON.stringify(start), JSON.stringify(end), startLabel, endLabel],
    { enabled: start != null && end != null }
  )

  return <div ref={containerRef} className="w-full rounded-lg" style={{ height }} />
}

function addLabeledMarker(map, overlays, position, label, color) {
  const latlng = new window.kakao.maps.LatLng(position.lat, position.lng)

  overlays.push(new window.kakao.maps.Marker({ position: latlng, map }))
  overlays.push(
    new window.kakao.maps.CustomOverlay({
      position: latlng,
      map,
      yAnchor: 1.8,
      content: `<div style="background:${color};color:#fff;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:600;white-space:nowrap;">${label}</div>`,
    })
  )
}

function clearOverlays(overlays) {
  overlays.forEach((overlay) => overlay.setMap(null))
}

export default RouteMap
