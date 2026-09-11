import { useEffect, useRef } from 'react'
import { useKakaoMapsLoader } from '../../hooks/useKakaoMapsLoader'
import { useKakaoMapResize } from '../../hooks/useKakaoMapResize'
import { createPinContent, trackingColorAt } from '../../utils/mapMarker'

// 확정된 목적지로 이동하는 참가자들을 실시간으로 보여주는 표시용 컴포넌트.
// 좌표가 3초마다 갱신되는 지도라 RouteMap 을 재사용하지 않고 형제로 둔다.
//
// RouteMap 은 그릴 때마다 setBounds 로 화면을 다시 맞춘다. 한 번 그리고 끝나는 경로에는 맞지만
// 여기서 그러면 3초마다 지도가 다시 줌되어, 사용자가 확대하거나 옮겨 둔 것을 매번 되돌린다.
// 그래서 이 컴포넌트는 처음 한 번만 화면을 맞추고, 이후에는 마커와 선의 값만 바꾼다
// (MidpointMap 의 "한 번 만들고 위치만 옮긴다" 방식을 여러 개로 늘린 것이다).
function TrackingMap({ destination, participants, height = 380 }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const destinationOverlayRef = useRef(null)
  // participantId -> { overlay, polyline, label }
  // 참가자마다 마커와 궤적을 하나씩 만들어 두고 계속 재사용한다.
  const layersRef = useRef(new Map())
  // 화면을 맞춘 적이 있는지. 처음 한 번만 true 로 바뀐다.
  const hasFitBoundsRef = useRef(false)

  useKakaoMapResize(containerRef, mapRef)

  // 그릴 것이 실제로 달라졌을 때만 다시 그린다. 좌표 배열을 통째로 JSON.stringify 하면
  // 궤적이 길어질수록 비교 비용이 커지므로, 늘어난 궤적 길이와 상태만 본다
  // (같은 점을 다시 받는 경우는 없다. 서버가 순번으로 중복을 막는다).
  const drawKey = participants
    .map((participant) => `${participant.participantId}:${participant.trail?.length ?? 0}:${participant.status}`)
    .join('|')

  // 화면을 떠날 때 지도에 올린 것을 모두 떼어낸다. 두면 다음 지도에 그대로 쌓인다.
  useEffect(() => {
    const layers = layersRef.current

    return () => {
      layers.forEach(({ overlay, polyline }) => {
        overlay.setMap(null)
        polyline.setMap(null)
      })
      layers.clear()
      destinationOverlayRef.current?.setMap(null)
      destinationOverlayRef.current = null
    }
  }, [])

  useKakaoMapsLoader(
    () => {
      const maps = window.kakao.maps
      const destinationPosition = new maps.LatLng(destination.lat, destination.lng)

      if (!mapRef.current) {
        mapRef.current = new maps.Map(containerRef.current, {
          center: destinationPosition,
          level: 6,
        })
      }
      const map = mapRef.current

      if (destinationOverlayRef.current) {
        destinationOverlayRef.current.setPosition(destinationPosition)
      } else {
        destinationOverlayRef.current = new maps.CustomOverlay({
          position: destinationPosition,
          map,
          // 핀 끝이 좌표에 놓이게 한다.
          yAnchor: 1,
          content: createPinContent({ label: destination.name }),
        })
      }

      participants.forEach((participant, index) => {
        const current = participant.current
        // 시작 직후에는 좌표를 아직 한 번도 못 받은 참가자가 있다. 그 사람은 이번엔 건너뛰고
        // 첫 좌표가 도착한 다음 갱신에서 만든다.
        if (current?.lat == null || current?.lng == null) return

        const position = new maps.LatLng(current.lat, current.lng)
        const color = trackingColorAt(index)
        const path = (participant.trail ?? []).map((point) => new maps.LatLng(point.lat, point.lng))
        // 도착은 지도에서도 바로 읽혀야 한다. 아래 목록을 보지 않고도 끝난 사람을 구분한다.
        const label = participant.status === 'ARRIVED'
          ? `${participant.nickname} 도착`
          : participant.nickname

        const layer = layersRef.current.get(participant.participantId)

        if (layer) {
          layer.overlay.setPosition(position)
          layer.polyline.setPath(path)
          // 라벨은 바뀔 때만 새로 그린다. 매번 setContent 하면 3초마다 마커 DOM 이 새로 만들어진다.
          if (layer.label !== label) {
            layer.overlay.setContent(createPinContent({ label, color }))
            layer.label = label
          }
          return
        }

        layersRef.current.set(participant.participantId, {
          label,
          overlay: new maps.CustomOverlay({
            position,
            map,
            yAnchor: 1,
            content: createPinContent({ label, color }),
          }),
          // 궤적은 참가자당 하나만 만들어 두고 setPath 로 늘린다.
          // 갱신마다 새 Polyline 을 만들면 이전 선이 지도에 남아 겹쳐 그려진다.
          polyline: new maps.Polyline({
            map,
            path,
            strokeColor: color,
            strokeWeight: 5,
            strokeOpacity: 0.85,
            strokeStyle: 'solid',
          }),
        })
      })

      // 출발점들과 목적지가 한 화면에 들어오도록 맞추는 것은 처음 한 번뿐이다.
      // 좌표를 받은 사람이 아직 아무도 없으면 맞출 대상이 목적지 하나뿐이라 최대 확대가 되므로,
      // 한 명이라도 들어온 다음으로 미룬다.
      const hasAnyPosition = participants.some(
        (participant) => participant.current?.lat != null && participant.current?.lng != null
      )
      if (!hasFitBoundsRef.current && hasAnyPosition) {
        const bounds = new maps.LatLngBounds()
        bounds.extend(destinationPosition)
        participants.forEach((participant) => {
          const current = participant.current
          if (current?.lat == null || current?.lng == null) return
          bounds.extend(new maps.LatLng(current.lat, current.lng))
        })

        // 컨테이너가 막 렌더링된 시점엔 지도가 자기 크기를 몰라서, 크기를 다시 계산시킨 뒤
        // bounds 를 맞춰야 확대가 어긋나지 않는다.
        map.relayout()
        map.setBounds(bounds)
        hasFitBoundsRef.current = true
      }
    },
    [drawKey, destination?.lat, destination?.lng, destination?.name],
    { enabled: destination?.lat != null && destination?.lng != null }
  )

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden rounded-card border border-edge shadow-surface"
      style={{ height }}
    />
  )
}

export default TrackingMap
