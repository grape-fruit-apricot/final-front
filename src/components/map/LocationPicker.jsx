import { useEffect, useRef, useState } from 'react'
import { useKakaoMapsLoader } from '../../hooks/useKakaoMapsLoader'
import ErrorMessage from '../common/ErrorMessage'

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY
// 지도가 처음 뜰 때 보여줄 중심좌표(실제 위치는 지도를 클릭하거나 검색해서 고른다)
const DEFAULT_CENTER = { lat: 37.5696, lng: 126.9842 }

// 지도를 클릭하거나 주소를 검색해서 좌표 하나를 고르는 공통 컴포넌트
function LocationPicker({ value, onChange, height = 192 }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const geocoderRef = useRef(null)
  const placesRef = useRef(null)
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  })

  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState(null)

  function placeMarker(latlng) {
    if (markerRef.current) {
      markerRef.current.setPosition(latlng)
    } else {
      markerRef.current = new window.kakao.maps.Marker({ position: latlng, map: mapRef.current })
    }
    mapRef.current.panTo(latlng)
  }

  function moveTo(lat, lng) {
    const latlng = new window.kakao.maps.LatLng(lat, lng)
    placeMarker(latlng)
    onChangeRef.current({ lat, lng })
  }

  // 지도에 건 클릭 리스너는 화면을 떠날 때 직접 떼어내야 한다(카카오 SDK에 지도 파기 API가 없다).
  const clickListenerRef = useRef(null)
  useEffect(() => {
    return () => {
      if (mapRef.current && clickListenerRef.current) {
        window.kakao.maps.event.removeListener(mapRef.current, 'click', clickListenerRef.current)
      }
    }
  }, [])

  useKakaoMapsLoader(() => {
    const map = new window.kakao.maps.Map(containerRef.current, {
      center: new window.kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
      level: 5,
    })
    mapRef.current = map
    geocoderRef.current = new window.kakao.maps.services.Geocoder()
    placesRef.current = new window.kakao.maps.services.Places()

    clickListenerRef.current = (mouseEvent) => {
      const latlng = mouseEvent.latLng
      placeMarker(latlng)
      onChangeRef.current({ lat: latlng.getLat(), lng: latlng.getLng() })
    }
    window.kakao.maps.event.addListener(map, 'click', clickListenerRef.current)
  }, [])

  function handleSearch() {
    const keyword = query.trim()
    if (!keyword || !geocoderRef.current) return
    setIsSearching(true)
    setSearchError(null)

    // 주소로 먼저 찾고, 못 찾으면(역 이름 같은 장소명일 수 있으니) 장소 검색으로 한 번 더 시도한다.
    geocoderRef.current.addressSearch(keyword, (addressResults, status) => {
      if (status === window.kakao.maps.services.Status.OK && addressResults.length > 0) {
        moveTo(Number(addressResults[0].y), Number(addressResults[0].x))
        setIsSearching(false)
        return
      }

      placesRef.current.keywordSearch(keyword, (placeResults, placeStatus) => {
        setIsSearching(false)
        if (placeStatus === window.kakao.maps.services.Status.OK && placeResults.length > 0) {
          moveTo(Number(placeResults[0].y), Number(placeResults[0].x))
        } else {
          setSearchError('검색 결과가 없습니다.')
        }
      })
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleSearch()
            }
          }}
          placeholder="주소/장소 검색"
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
      <div ref={containerRef} className="w-full rounded-lg bg-background" style={{ height }}>
        {!KAKAO_JS_KEY && (
          <p className="p-4 text-sm text-app-text/60">지도를 불러오려면 VITE_KAKAO_JS_KEY 설정이 필요합니다.</p>
        )}
      </div>
      {value && (
        <p className="text-xs text-white/70">
          선택한 위치: {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
        </p>
      )}
    </div>
  )
}

export default LocationPicker
