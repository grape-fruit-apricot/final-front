import { useRef, useState } from 'react'
import { useKakaoMapsLoader } from '../../hooks/useKakaoMapsLoader'
import Button from './Button'
import Card from './Card'
import ErrorMessage from './ErrorMessage'

// 중간지점 주변에서 식당을 검색해 방 목록에 추가하는 폼.
// 검색은 LocationPicker 와 동일하게 카카오 SDK 의 장소 검색을 쓰므로 별도 API 가 필요 없다.
const SEARCH_RADIUS_METERS = 5000
const FOOD_CATEGORY_CODE = 'FD6'
// 목록이 길어지면 고르기 어려워 상위 5건만 보여준다(카카오 SDK 허용 범위는 1~15).
const MAX_SEARCH_RESULTS = 5

function RestaurantSearchForm({ lat, lng, onAdd, isAdding }) {
  const placesRef = useRef(null)

  const [keyword, setKeyword] = useState('')
  const [places, setPlaces] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState(null)

  useKakaoMapsLoader(() => {
    placesRef.current = new window.kakao.maps.services.Places()
  }, [])

  const handleSearch = () => {
    const trimmed = keyword.trim()
    if (!trimmed || !placesRef.current) return

    setIsSearching(true)
    setSearchError(null)

    // 중간지점 주변으로 범위를 좁히고 음식점 카테고리만 찾는다.
    placesRef.current.keywordSearch(
      trimmed,
      (results, status) => {
        setIsSearching(false)
        if (status === window.kakao.maps.services.Status.OK && results.length > 0) {
          // size 옵션으로 이미 5건만 받지만, SDK 가 옵션을 무시하는 경우를 대비해 한 번 더 자른다.
          setPlaces(results.slice(0, MAX_SEARCH_RESULTS))
        } else {
          setPlaces([])
          setSearchError('검색 결과가 없습니다.')
        }
      },
      {
        location: new window.kakao.maps.LatLng(lat, lng),
        radius: SEARCH_RADIUS_METERS,
        category_group_code: FOOD_CATEGORY_CODE,
        size: MAX_SEARCH_RESULTS,
      }
    )
  }

  const handleAdd = (place) => {
    onAdd({
      kakaoPlaceId: Number(place.id),
      name: place.place_name,
      category: place.category_name,
      address: place.address_name,
      // 도로명주소가 없는 장소가 있어 지번주소로 대체한다(서버에서 필수값).
      roadAddress: place.road_address_name || place.address_name,
      phone: place.phone,
      placeUrl: place.place_url,
      lat: Number(place.y),
      lng: Number(place.x),
    })
  }

  return (
    <div className="flex flex-col gap-2">
      {/* 검색창은 테두리 상자가 아니라 하나의 알약이다. 지도 위에 떠 있어도 어울린다. */}
      <div className="flex items-center gap-1.5 rounded-full border border-edge bg-surface p-1.5 pl-3 shadow-surface">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px] flex-none text-accent-ink" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleSearch()
            }
          }}
          placeholder="식당 이름 검색"
          className="min-h-11 min-w-0 flex-1 bg-transparent px-2 text-[15px] text-app-text placeholder:text-ink-faint focus:outline-none"
        />
        <Button variant="primary" size="sm" className="flex-none" onClick={handleSearch} disabled={isSearching}>
          검색
        </Button>
      </div>

      {searchError && <ErrorMessage message={searchError} />}

      {places.length > 0 && (
        <ul className="flex flex-col gap-2">
          {places.map((place) => (
            <Card
              as="li"
              key={place.id}
              className="flex items-center gap-3 px-3.5 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-bold tracking-tight text-app-text">
                  {place.place_name}
                </p>
                <p className="mt-0.5 truncate text-[13px] text-ink-soft">{place.category_name}</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="shrink-0"
                onClick={() => handleAdd(place)}
                disabled={isAdding}
              >
                추가
              </Button>
            </Card>
          ))}
        </ul>
      )}
    </div>
  )
}

export default RestaurantSearchForm
