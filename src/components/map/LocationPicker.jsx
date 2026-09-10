import { useEffect, useRef, useState } from 'react'
import { useKakaoMapsLoader } from '../../hooks/useKakaoMapsLoader'
import { useKakaoMapResize } from '../../hooks/useKakaoMapResize'
import { createPinContent } from '../../utils/mapMarker'
import Button from '../common/Button'
import ErrorMessage from '../common/ErrorMessage'

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY
// 지도가 처음 뜰 때 보여줄 중심좌표(실제 위치는 지도를 클릭하거나 검색해서 고른다)
const DEFAULT_CENTER = { lat: 37.5696, lng: 126.9842 }

// 지도를 클릭하거나 주소를 검색해서 좌표 하나를 고르는 공통 컴포넌트.
// fill 을 켜면 고정 높이 대신 남은 세로 공간을 지도가 전부 차지한다.
function LocationPicker({ value, onChange, height = 300, fill = false }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const geocoderRef = useRef(null)
  const placesRef = useRef(null)
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  })

  // fill 이면 지도 크기가 레이아웃에 따라 정해지므로, 크기가 바뀔 때마다 다시 맞춰야 한다.
  useKakaoMapResize(containerRef, mapRef)

  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState(null)

  function placeMarker(latlng) {
    if (markerRef.current) {
      markerRef.current.setPosition(latlng)
    } else {
      markerRef.current = new window.kakao.maps.CustomOverlay({
        position: latlng,
        map: mapRef.current,
        // 핀 끝이 좌표에 놓이게 한다.
        yAnchor: 1,
        content: createPinContent({ label: '출발지' }),
      })
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
    <div className={`flex flex-col gap-2 ${fill ? "min-h-0 flex-1" : ""}`}>
      <div className="flex items-center gap-1.5 rounded-full border border-edge bg-surface p-1.5 pl-3 shadow-surface">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px] flex-none text-accent-ink" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
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
          className="min-h-11 min-w-0 flex-1 bg-transparent px-2 text-[15px] text-app-text placeholder:text-ink-faint focus:outline-none"
        />
        <Button variant="primary" size="sm" className="flex-none" onClick={handleSearch} disabled={isSearching}>
          검색
        </Button>
      </div>
      {searchError && <ErrorMessage message={searchError} />}
      <div
        ref={containerRef}
        className={`w-full overflow-hidden rounded-card border border-edge bg-fill shadow-surface ${
          fill ? 'min-h-0 flex-1' : ''
        }`}
        style={fill ? undefined : { height }}
      >
        {!KAKAO_JS_KEY && (
          <p className="p-4 text-sm text-ink-soft">지도를 불러오려면 VITE_KAKAO_JS_KEY 설정이 필요합니다.</p>
        )}
      </div>
      {/* 좌표 숫자는 보여주지 않는다. 고른 위치는 지도 위 마커로 확인하면 되고,
          위도·경도는 사용자가 판단에 쓸 수 있는 정보가 아니다. */}
      {value && (
        <p className="flex items-center gap-1.5 px-1 text-[13px] font-bold text-accent-ink">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="size-4 flex-none" aria-hidden="true">
            <path d="M5 12.5 10 17.5 19 7" />
          </svg>
          위치가 선택되었습니다
        </p>
      )}
    </div>
  )
}

export default LocationPicker
