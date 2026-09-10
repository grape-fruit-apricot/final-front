import { useEffect } from 'react'

// 카카오 지도는 생성 시점의 컨테이너 크기를 기억한다. CSS 가 나중에 적용되거나
// 레이아웃이 바뀌면 지도만 옛 크기로 남아 한쪽이 빈 채로 그려진다.
// 컨테이너 크기를 지켜보다가 바뀔 때마다 relayout 으로 다시 맞춘다.
//
// 지도를 고정 높이가 아니라 남은 공간을 채우도록(fill) 두면 크기가 레이아웃에 따라
// 정해지므로, 이 훅 없이는 첫 렌더에서 어긋난 채로 굳는다.
export function useKakaoMapResize(containerRef, mapRef) {
  useEffect(() => {
    const container = containerRef.current
    if (!container || typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(() => {
      const map = mapRef.current
      if (!map) return
      // 중심을 기억했다가 되돌린다. relayout 만 하면 중심이 좌상단으로 밀린다.
      const center = map.getCenter()
      map.relayout()
      map.setCenter(center)
    })
    observer.observe(container)

    return () => observer.disconnect()
  }, [containerRef, mapRef])
}
