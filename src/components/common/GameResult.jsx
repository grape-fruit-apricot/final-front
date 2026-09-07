import ShareRestaurantButton from "./ShareRestaurantButton";

// 확정된 식당과 우승자를 발표하는 화면. 스크롤 없이 한 화면에 담는 것이 목적이라
// 경로와 관련된 것은 여기에 두지 않고 "경로 보기"로 넘긴다(RouteDetail).
//
// 게임으로 정해졌으면 서버가 알려준 승자 한 명을 그대로 쓴다.
// 무작위로 정해졌을 때만 "확정된 식당을 고른 참가자"로 계산한다
// (그 경우 같은 식당을 고른 사람이 여럿일 수 있고, 그들 모두가 우승자다).
function GameResult({
  result,
  participants,
  selections,
  winnerParticipantId,
  onShowRoute,
}) {
  const { restaurant } = result;

  const winners = winnerParticipantId
    ? participants.filter(
        (participant) =>
          String(participant.participantId) === String(winnerParticipantId),
      )
    : participants.filter((participant) =>
        selections.some(
          (selection) =>
            String(selection.participantId) ===
              String(participant.participantId) &&
            selection.restaurantId === restaurant.restaurantId,
        ),
      );

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-center font-semibold text-white">최종 결과!</h2>

      <p className="text-center text-6xl" aria-hidden="true">
        🏆
      </p>

      {/* 우승자를 못 찾는 경우가 있어(선택 기록이 정리된 방 등) 그때는 식당만 발표한다. */}
      {winners.length > 0 && (
        <p className="text-center text-xl font-bold text-point-orange">
          {winners.map((winner) => winner.nickname).join(", ")} 님의 승리!
        </p>
      )}
      <p className="text-center font-semibold text-white">
        최종 식당이 결정되었어요!
      </p>

      <div className="rounded-lg bg-white px-4 py-3 text-app-text">
        <p className="font-semibold">{restaurant.name}</p>
        {restaurant.category && (
          <p className="mt-0.5 text-xs text-app-text/60">
            {restaurant.category}
          </p>
        )}
        <p className="mt-1 text-sm text-app-text/80">
          {restaurant.roadAddress || restaurant.address}
        </p>
      </div>

      <button
        type="button"
        onClick={onShowRoute}
        className="mt-1 min-h-11 w-full rounded-lg bg-point-orange font-semibold text-white"
      >
        경로 보기
      </button>

      <ShareRestaurantButton restaurant={restaurant} />
    </div>
  );
}

export default GameResult;
