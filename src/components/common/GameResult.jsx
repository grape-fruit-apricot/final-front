import RouteMap from '../map/RouteMap'
import EmptyState from './EmptyState'
import ShareRestaurantButton from './ShareRestaurantButton'

// 확정된 식당과 우승자를 발표하고, 내 출발지에서 그 식당까지의 경로를 보여주는 화면.
// 우승자는 별도 API 없이 "확정된 식당을 고른 참가자"로 계산한다.
function GameResult({ result, participants, selections, myParticipantId }) {
  const { restaurant, participantRoutes } = result

  const winners = participants.filter((participant) =>
    selections.some(
      (selection) =>
        String(selection.participantId) === String(participant.participantId) &&
        selection.restaurantId === restaurant.restaurantId
    )
  )

  const me = participants.find(
    (participant) => String(participant.participantId) === String(myParticipantId)
  )
  const myRoute = participantRoutes.find(
    (route) => String(route.participantId) === String(myParticipantId)
  )

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
          <p className="text-center text-white">도보 약 {myRoute.timeMinutes}분</p>
        </>
      ) : (
        <EmptyState message="내 경로를 찾지 못했습니다." />
      )}

      <h2 className="mt-2 font-semibold text-white">참가자별 소요시간</h2>
      <ul className="flex flex-col gap-2">
        {participantRoutes.map((route) => (
          <li
            key={route.participantId}
            className="flex items-center justify-between gap-4 text-white"
          >
            <span className="truncate">{route.nickname}</span>
            <span className="shrink-0 text-white/80">도보 {route.timeMinutes}분</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default GameResult
