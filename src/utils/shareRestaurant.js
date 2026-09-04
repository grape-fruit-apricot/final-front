import { copyToClipboard } from './clipboard'

// 카카오맵 장소 링크. lat/lng 만으로 만들 수 있어 placeUrl 유무에 의존하지 않는다.
// (확정 결과를 새로고침으로 복구하면 placeUrl 이 안 내려온다)
function kakaoMapLink(name, lat, lng) {
  return `https://map.kakao.com/link/map/${encodeURIComponent(name)},${lat},${lng}`
}

// 최종 선정된 식당을 방 밖(카톡 등)으로 공유한다.
// navigator.share(OS 공유 시트)를 우선 쓰고, 없거나 실패하면 링크를 클립보드에 복사한다.
// 반환: 'shared'(공유창 띄움/취소) | 'copied'(복사됨). 복사까지 실패하면 예외를 던진다.
export async function shareRestaurant(restaurant) {
  const { name, lat, lng } = restaurant
  const address = restaurant.roadAddress || restaurant.address || ''
  const url = kakaoMapLink(name, lat, lng)
  const text = address ? `${name}\n${address}` : name

  if (navigator.share) {
    try {
      await navigator.share({ title: name, text, url })
      return 'shared'
    } catch (err) {
      // 사용자가 공유 시트를 닫은 것뿐이면 복사로 넘어가지 않는다.
      if (err?.name === 'AbortError') {
        return 'shared'
      }
      // 그 외(미지원 환경 등)는 아래 복사 폴백으로 진행한다.
    }
  }

  await copyToClipboard(`${text}\n${url}`)
  return 'copied'
}
