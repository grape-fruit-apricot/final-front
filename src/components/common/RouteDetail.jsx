import { useState } from 'react'
import RouteMap from '../map/RouteMap'
import ListGroup from './ListGroup'
import EmptyState from './EmptyState'
import ErrorMessage from './ErrorMessage'

// 확정된 식당은 걸어가기엔 먼 경우가 많아 대중교통을 먼저 둔다.
const TRAVEL_MODES = [
  { value: 'TRANSIT', label: '대중교통' },
  { value: 'WALK', label: '도보' },
]

// 확정된 식당까지의 경로 화면. 결과 발표(GameResult)에서 "경로 보기"를 누르면 열린다.
// 경로와 관련된 것(지도·이동수단·소요시간)은 전부 여기에 모으고, 결과 화면은 발표만 맡는다.
// travelMode 는 result 와 짝이라 MainPage 가 들고 있다. 여기서 바꾸면 경로가 도착하기 전에
// 목록이 비어 "경로를 찾지 못했습니다"가 뜨고 지도가 언마운트됐다가 새로 만들어진다.
function RouteDetail({ result, participants, myParticipantId, travelMode, onBack, onTravelModeChange }) {
  const { restaurant, participantRoutes } = result
  // 누른 순간 세그먼티드가 먼저 움직이게만 하는 값. 실제 내용은 travelMode 가 정한다.
  const [pendingMode, setPendingMode] = useState(null)
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

    setPendingMode(nextMode)
    setModeError(null)
    setIsChangingMode(true)
    try {
      await onTravelModeChange?.(nextMode)
    } catch (error) {
      // 실패하면 보고 있던 이동수단이 그대로 남는다. 세그먼티드도 되돌린다.
      setModeError(error)
    } finally {
      setPendingMode(null)
      setIsChangingMode(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 탭을 옮기는 게 아니라 결과 발표로 되돌아가는 것이라 라우터를 쓰지 않는다. */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="결과로 돌아가기"
          className="-ml-1.5 flex size-11 shrink-0 items-center justify-center rounded-full text-app-text transition-transform duration-150 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-point-orange"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="size-5">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <span className="text-xs font-extrabold tracking-[0.16em] text-ink-soft">경로 안내</span>
      </div>

      <div>
        <h2 className="text-title font-extrabold text-app-text">{restaurant.name}</h2>
        <p className="mt-1 text-[15px] text-ink-soft">
          {me && myRoute
            ? `내 ${travelModeLabel} 약 ${myRoute.timeMinutes}분 · `
            : ''}
          {restaurant.roadAddress || restaurant.address}
        </p>
      </div>

      {me && myRoute ? (
        <RouteMap
          segments={myRoute.segments}
          points={myRoute.points}
          travelMode={myRoute.travelMode}
          start={{ lat: me.prefLat, lng: me.prefLng }}
          end={{ lat: restaurant.lat, lng: restaurant.lng }}
          startLabel="내 위치"
          endLabel={restaurant.name}
        />
      ) : (
        <EmptyState message={`내 ${travelModeLabel} 경로를 찾지 못했습니다.`} />
      )}

      {/* iOS 세그먼티드 컨트롤. 선택된 쪽만 흰 알약으로 떠오른다. */}
      <div
        className="grid grid-cols-2 gap-1 rounded-full bg-fill p-1"
        role="group"
        aria-label="이동수단 선택"
      >
        {TRAVEL_MODES.map((mode) => {
          const isSelected = (pendingMode ?? travelMode) === mode.value

          return (
            <button
              key={mode.value}
              type="button"
              onClick={() => handleTravelModeChange(mode.value)}
              disabled={isChangingMode}
              aria-pressed={isSelected}
              className={`min-h-11 rounded-full text-sm font-bold transition-[background-color,color,box-shadow] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-point-orange disabled:opacity-40 ${
                isSelected ? 'bg-surface text-app-text shadow-surface' : 'text-ink-soft'
              }`}
            >
              {mode.label}
            </button>
          )
        })}
      </div>

      {modeError && (
        <ErrorMessage
          message={modeError.message || `${travelModeLabel} 경로를 불러오지 못했습니다.`}
        />
      )}

      {selectedRoutes.length > 0 ? (
        <ListGroup title="참가자별 소요시간">
          {selectedRoutes.map((route) => {
            const isMe = String(route.participantId) === String(myParticipantId)

            return (
              <div
                key={`${route.participantId}:${route.travelMode}`}
                className="flex min-h-14 items-center justify-between gap-4 px-4 py-3"
              >
                <span className="flex min-w-0 items-center gap-3">
                  {/* 채워진 주황 아바타는 앱 전체에서 "나" 한 가지 뜻으로만 쓴다. */}
                  <span
                    className={`flex size-8 flex-none items-center justify-center rounded-full text-[13px] font-extrabold ${
                      isMe ? 'bg-point-orange text-white' : 'bg-fill text-app-text'
                    }`}
                    aria-hidden="true"
                  >
                    {route.nickname?.trim().charAt(0) || '?'}
                  </span>
                  <span className="truncate text-[17px] font-bold tracking-tight text-app-text">
                    {route.nickname}
                  </span>
                </span>
                <span className="shrink-0 text-[17px] font-extrabold text-app-text" data-numeric>
                  {route.timeMinutes}분
                </span>
              </div>
            )
          })}
        </ListGroup>
      ) : (
        <EmptyState message={`${travelModeLabel} 경로를 찾지 못했습니다.`} />
      )}
    </div>
  )
}

export default RouteDetail
