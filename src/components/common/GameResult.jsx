import { useState } from 'react'
import RouteMap from '../map/RouteMap'
import EmptyState from './EmptyState'
import ShareRestaurantButton from './ShareRestaurantButton'

const TRAVEL_MODES = [
  { value: 'WALK', label: '도보' },
  { value: 'TRANSIT', label: '대중교통' },
]

// 확정된 식당과 우승자를 발표하고, 내 출발지에서 그 식당까지의 경로를 보여주는 화면.
// 게임으로 정해졌으면 서버가 알려준 승자 한 명을 그대로 쓴다.
// 무작위로 정해졌을 때만 "확정된 식당을 고른 참가자"로 계산한다
// (그 경우 같은 식당을 고른 사람이 여럿일 수 있고, 그들 모두가 우승자다).
function GameResult({
  result,
  participants,
  selections,
  myParticipantId,
  winnerParticipantId,
  onTravelModeChange,
}) {
  const { restaurant, participantRoutes } = result
  const [travelMode, setTravelMode] = useState('WALK')
  const [isChangingMode, setIsChangingMode] = useState(false)
  const [modeError, setModeError] = useState(null)

  const selectedRoutes = participantRoutes.filter((route) => route.travelMode === travelMode)
  const travelModeLabel = TRAVEL_MODES.find((mode) => mode.value === travelMode)?.label

  const winners = winnerParticipantId
    ? participants.filter(
        (participant) =>
          String(participant.participantId) === String(winnerParticipantId)
      )
    : participants.filter((participant) =>
        selections.some(
          (selection) =>
            String(selection.participantId) === String(participant.participantId) &&
            selection.restaurantId === restaurant.restaurantId
        )
      )

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
      <p className="text-center text-sm text-white/70">우승자</p>
      <p className="text-center text-2xl font-bold text-point-orange">
        {winners.length > 0 ? winners.map((winner) => winner.nickname).join(', ') : '없음'}
      </p>

      <div className="rounded-lg bg-white px-4 py-3 text-app-text">
        <p className="font-semibold">{restaurant.name}</p>
        {restaurant.category && (
          <p className="mt-0.5 text-xs text-app-text/60">{restaurant.category}</p>
        )}
        <p className="mt-1 text-sm text-app-text/80">
          {restaurant.roadAddress || restaurant.address}
        </p>
      </div>

      <ShareRestaurantButton restaurant={restaurant} />

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

      <h2 className="mt-2 font-semibold text-white">내 경로</h2>
      {me && myRoute ? (
        <>
          <RouteMap
            points={myRoute.points}
            start={{ lat: me.prefLat, lng: me.prefLng }}
            end={{ lat: restaurant.lat, lng: restaurant.lng }}
            startLabel="내 위치"
            endLabel={restaurant.name}
          />
          <p className="text-center text-white">
            {travelModeLabel} 약 {myRoute.timeMinutes}분
          </p>
        </>
      ) : (
        <EmptyState message={`내 ${travelModeLabel} 경로를 찾지 못했습니다.`} />
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

export default GameResult
