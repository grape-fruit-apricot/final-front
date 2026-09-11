// 두 좌표 사이의 직선 거리(미터). 하버사인 공식.
// 실제 이동 거리가 아니라 "얼마나 멀리서 오는지" 감을 주는 용도라 직선으로 충분하다.
const EARTH_RADIUS_METERS = 6371000

export function distanceInMeters(from, to) {
  if (
    from?.lat == null || from?.lng == null ||
    to?.lat == null || to?.lng == null
  ) {
    return null
  }

  const toRadians = (degrees) => (degrees * Math.PI) / 180

  const dLat = toRadians(to.lat - from.lat)
  const dLng = toRadians(to.lng - from.lng)
  const lat1 = toRadians(from.lat)
  const lat2 = toRadians(to.lat)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(a))
}

// 1km 아래는 미터로, 그 위는 소수 한 자리 km 로 읽는다.
// 100m 단위로 끊어서 "1234m" 처럼 무의미하게 정밀한 숫자를 만들지 않는다.
export function formatDistance(meters) {
  if (meters == null) return null
  if (meters < 1000) return `${Math.round(meters / 100) * 100}m`
  return `${(meters / 1000).toFixed(1)}km`
}

// 이동 추적 화면용. 위 formatDistance 는 100m 단위로 끊는데, 도착 판정이 50m 인 추적에서는
// 남은 거리가 "100m" 다음에 곧바로 "0m" 이 된다(Math.round(48 / 100) * 100 === 0).
// 목적지에 다가가는 마지막 구간이 화면에서 통째로 사라지므로 그 구간만 10m 단위로 읽는다.
// 위쪽 함수를 바꾸지 않는 이유는 그 값이 "얼마나 멀리서 오는지" 감을 주는 자리(경로·식당 목록)에
// 쓰이고 있어서다. 거기서는 10m 단위가 오히려 과하게 정밀하다.
export function formatApproachDistance(meters) {
  if (meters == null) return null
  if (meters < 1000) return `${Math.round(meters / 10) * 10}m`
  return `${(meters / 1000).toFixed(1)}km`
}
