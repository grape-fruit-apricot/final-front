import { useEffect, useRef } from 'react'
import { useKakaoMapsLoader } from '../../hooks/useKakaoMapsLoader'
import { normalizeSegmentType, resolveRouteColors, SEGMENT_STYLES } from '../../utils/routeStyles'

// 출발지에서 목적지까지 이동수단별 경로를 나누어 그리는 표시용 컴포넌트.
// 구간 배열을 JSON.stringify 해서 의존성으로 거는 이유는, 참조만 바뀌고 내용이 같을 때
// 지도를 다시 만들지 않기 위해서다(확대·이동 상태가 초기화되고 자원도 낭비된다).
function RouteMap({ segments, points, travelMode, start, end, startLabel = '출발', endLabel = '도착', height = 400 }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  // 지도 위에 올린 폴리라인·마커·오버레이를 모아둔다. 다시 그리기 전과 화면을 떠날 때
  // setMap(null) 로 떼어내지 않으면 이전 것들이 지도에 그대로 쌓인다.
  const overlaysRef = useRef([])

  const routeSegments = Array.isArray(segments) && segments.length > 0
    ? segments
    : [{ segmentType: travelMode === 'WALK' ? 'WALKING' : 'UNKNOWN', points: Array.isArray(points) ? points : [] }]
  const routeColors = resolveRouteColors(routeSegments)
  const visibleTypes = [...new Set(
    routeSegments
      .filter((segment) => Array.isArray(segment.points) && segment.points.length > 1)
      .map((segment) => normalizeSegmentType(segment.segmentType))
  )]

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

      routeSegments.forEach((segment) => {
        if (!Array.isArray(segment.points) || segment.points.length < 2) return

        const segmentType = normalizeSegmentType(segment.segmentType)
        const segmentStyle = SEGMENT_STYLES[segmentType]
        const path = segment.points.map(
          (point) => new window.kakao.maps.LatLng(point.lat, point.lng)
        )

        overlaysRef.current.push(
          new window.kakao.maps.Polyline({
            map,
            path,
            strokeColor: routeColors.colorForLeg(segment),
            strokeWeight: segmentStyle.weight,
            strokeOpacity: 0.85,
            strokeStyle: segmentStyle.style,
          })
        )
        path.forEach((latlng) => bounds.extend(latlng))
      })

      addLabeledMarker(map, overlaysRef.current, start, startLabel, '#17171A')
      bounds.extend(new window.kakao.maps.LatLng(start.lat, start.lng))

      addLabeledMarker(map, overlaysRef.current, end, endLabel, '#D2401C')
      bounds.extend(new window.kakao.maps.LatLng(end.lat, end.lng))

      // 컨테이너가 막 렌더링된 시점엔 지도가 자기 크기를 몰라서, 크기를 다시 계산시킨 뒤
      // bounds 를 맞춰야 확대가 어긋나지 않는다.
      map.relayout()
      map.setBounds(bounds)
    },
    [JSON.stringify(segments), JSON.stringify(points), travelMode, JSON.stringify(start), JSON.stringify(end), startLabel, endLabel],
    { enabled: start != null && end != null }
  )

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="w-full overflow-hidden rounded-card border border-edge shadow-surface"
        style={{ height }}
      />
      {visibleTypes.length > 0 && (
        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2.5 rounded-full border border-white/70 bg-glass-strong px-3 py-1.5 text-xs font-bold text-app-text shadow-surface backdrop-blur-md">
          {visibleTypes.map((type) => (
            <div key={type} className="flex items-center gap-1">
              {[...new Set(routeSegments
                .filter((segment) => normalizeSegmentType(segment.segmentType) === type
                  && Array.isArray(segment.points) && segment.points.length > 1)
                .map(routeColors.colorForLeg))].map((color) => (
                <span
                  key={color}
                  className="inline-block w-5 border-t-4"
                  style={{
                    borderColor: color,
                    borderTopStyle: type === 'WALKING' ? 'dotted' : type === 'UNKNOWN' ? 'dashed' : 'solid',
                  }}
                />
              ))}
              <span>{SEGMENT_STYLES[type].label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function addLabeledMarker(map, overlays, position, label, color) {
  const latlng = new window.kakao.maps.LatLng(position.lat, position.lng)

  overlays.push(new window.kakao.maps.Marker({ position: latlng, map }))
  overlays.push(
    new window.kakao.maps.CustomOverlay({
      position: latlng,
      map,
      yAnchor: 1.8,
      content: `<div style="background:${color};color:#fff;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;white-space:nowrap;">${label}</div>`,
    })
  )
}

function clearOverlays(overlays) {
  overlays.forEach((overlay) => overlay.setMap(null))
}

export default RouteMap
