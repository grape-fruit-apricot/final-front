import { useState } from 'react'
import RouteMap from '../map/RouteMap'
import EmptyState from './EmptyState'

const TRAVEL_MODES = [
  { value: 'WALK', label: '도보' },
  { value: 'TRANSIT', label: '대중교통' },
]

// 확정된 식당까지의 경로 화면. 결과 발표(GameResult)에서 "경로 보기"를 누르면 열린다.
// 경로와 관련된 것(지도·이동수단·소요시간)은 전부 여기에 모으고, 결과 화면은 발표만 맡는다.
function RouteDetail({ result, participants, myParticipantId, onBack, onTravelModeChange }) {
  const { restaurant, participantRoutes } = result
  const [travelMode, setTravelMode] = useState('WALK')
  const [isChangingMode, setIsChangingMode] = useState(false)
  const [modeError, setModeError] = useState(null)

  const selectedRoutes = participantRoutes.filter((route) => route.travelMode === travelMode)
  const travelModeLabel = TRAVEL_MODES.find((mode) => mode.value === travelMode)?.label

  const me = participants.find(
    (participant) => String(participant.participantId) === String(myParticipantId)
  )
  const myRoute = selectedRoutes.find(
    (route) => String(route.participantId) === String(myParticipantId)
  )

  const handleTravelModeChange = async (nextMode) => {
    if (nextMode === travelMode || isChangingMode) return

    setTravelMode(nextMode)
    setModeError(null)
    setIsChangingMode(true)
    try {
      await onTravelModeChange?.(nextMode)
    } catch (error) {
      setModeError(error)
    } finally {
      setIsChangingMode(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* 탭을 옮기는 게 아니라 결과 발표로 되돌아가는 것이라 라우터를 쓰지 않는다. */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onBack}
          aria-label="결과로 돌아가기"
          className="-ml-2 flex size-11 shrink-0 items-center justify-center text-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <h2 className="font-semibold text-white">최종 식당 &amp; 경로 안내</h2>
      </div>

      {me && myRoute ? (
        <RouteMap
          points={myRoute.points}
          start={{ lat: me.prefLat, lng: me.prefLng }}
          end={{ lat: restaurant.lat, lng: restaurant.lng }}
          startLabel="내 위치"
          endLabel={restaurant.name}
        />
      ) : (
        <EmptyState message={`내 ${travelModeLabel} 경로를 찾지 못했습니다.`} />
      )}

      <div className="rounded-lg bg-white px-4 py-3 text-app-text">
        <p className="font-semibold">{restaurant.name}</p>
        {restaurant.category && (
          <p className="mt-0.5 text-xs text-app-text/60">{restaurant.category}</p>
        )}
        <p className="mt-1 text-sm text-app-text/80">
          {restaurant.roadAddress || restaurant.address}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-lg bg-white/10 p-1" aria-label="이동수단 선택">
        {TRAVEL_MODES.map((mode) => {
          const isSelected = travelMode === mode.value

          return (
            <button
              key={mode.value}
              type="button"
              onClick={() => handleTravelModeChange(mode.value)}
              disabled={isChangingMode}
              aria-pressed={isSelected}
              className={`min-h-10 rounded-md text-sm font-semibold transition-colors disabled:opacity-60 ${
                isSelected ? 'bg-point-orange text-white' : 'bg-white text-app-text'
              }`}
            >
              {mode.label}
            </button>
          )
        })}
      </div>

      {modeError && (
        <p className="text-center text-sm text-red-200">
          {modeError.message || `${travelModeLabel} 경로를 불러오지 못했습니다.`}
        </p>
      )}

      {me && myRoute && (
        <p className="text-center text-white">
          {travelModeLabel} 약 {myRoute.timeMinutes}분
        </p>
      )}

      <h2 className="mt-2 font-semibold text-white">참가자별 소요시간</h2>
      {selectedRoutes.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {selectedRoutes.map((route) => (
            <li
              key={`${route.participantId}:${route.travelMode}`}
              className="flex items-center justify-between gap-4 text-white"
            >
              <span className="truncate">{route.nickname}</span>
              <span className="shrink-0 text-white/80">
                {travelModeLabel} {route.timeMinutes}분
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState message={`${travelModeLabel} 경로를 찾지 못했습니다.`} />
      )}
    </div>
  )
}

export default RouteDetail
