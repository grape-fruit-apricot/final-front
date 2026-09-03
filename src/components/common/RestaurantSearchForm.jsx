import { useRef, useState } from 'react'
import { useKakaoMapsLoader } from '../../hooks/useKakaoMapsLoader'
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
      <div className="flex gap-2">
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
          className="min-h-11 flex-1 rounded-lg border border-main-navy bg-white px-4 text-app-text"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={isSearching}
          className="min-h-11 rounded-lg bg-point-orange px-4 font-semibold text-white disabled:opacity-60"
        >
          검색
        </button>
      </div>

      {searchError && <ErrorMessage message={searchError} />}

      {places.length > 0 && (
        <ul className="flex flex-col gap-2">
          {places.map((place) => (
            <li
              key={place.id}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-app-text"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{place.place_name}</p>
                <p className="truncate text-xs text-app-text/60">{place.category_name}</p>
              </div>
              <button
                type="button"
                onClick={() => handleAdd(place)}
                disabled={isAdding}
                className="min-h-11 shrink-0 rounded-lg bg-main-navy px-4 text-sm font-semibold text-white disabled:opacity-60"
              >
                추가
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default RestaurantSearchForm
