import Button from './Button'
import Card from './Card'
import ShareRestaurantButton from './ShareRestaurantButton'

// 확정된 식당과 우승자를 발표하는 화면. 스크롤 없이 한 화면에 담는 것이 목적이라
// 경로와 관련된 것은 여기에 두지 않고 "경로 보기"로 넘긴다(RouteDetail).
//
// 게임으로 정해졌으면 서버가 알려준 승자 한 명을 그대로 쓴다.
// 무작위로 정해졌을 때만 "확정된 식당을 고른 참가자"로 계산한다
// (그 경우 같은 식당을 고른 사람이 여럿일 수 있고, 그들 모두가 우승자다).
function GameResult({ result, participants, selections, winnerParticipantId, onShowRoute }) {
  const { restaurant } = result

  const winners = winnerParticipantId
    ? participants.filter(
        (participant) => String(participant.participantId) === String(winnerParticipantId)
      )
    : participants.filter((participant) =>
        selections.some(
          (selection) =>
            String(selection.participantId) === String(participant.participantId) &&
            selection.restaurantId === restaurant.restaurantId
        )
      )

  return (
    <div className="flex flex-col items-center">
      {/* 트로피는 이모지가 아니라 벡터로 그린다. 이모지는 기기마다 모양이 달라
          같은 화면이 안드로이드와 아이폰에서 다르게 보인다. */}
      <div className="relative flex items-center justify-center">
        <div className="absolute size-40 rounded-full bg-point-orange/10 blur-xl" aria-hidden="true" />
        <div className="relative flex size-28 items-center justify-center rounded-full border border-edge bg-surface shadow-raised">
          <svg viewBox="0 0 64 64" fill="none" className="size-14 text-point-orange" aria-hidden="true">
            <path d="M20 12h24v14a12 12 0 0 1-24 0V12Z" fill="currentColor" />
            <path d="M20 16h-6a6 6 0 0 0 6 10" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
            <path d="M44 16h6a6 6 0 0 1-6 10" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
            <path d="M32 38v8" stroke="currentColor" strokeWidth="4.2" strokeLinecap="round" />
            <rect x="21" y="46" width="22" height="6" rx="3" fill="currentColor" />
          </svg>
        </div>
      </div>

      <p className="mt-6 text-xs font-extrabold tracking-[0.16em] text-accent-ink">최종 결과!</p>

      {/* 우승자를 못 찾는 경우가 있어(선택 기록이 정리된 방 등) 그때는 식당만 발표한다. */}
      {winners.length > 0 && (
        <h2 className="mt-2 text-center text-display font-extrabold text-app-text">
          {winners.map((winner) => winner.nickname).join(', ')} 님의 승리!
        </h2>
      )}
      <p className="mt-2 text-center text-[15px] text-ink-soft">최종 식당이 결정되었어요!</p>

      <Card className="mt-7 flex w-full items-center gap-3.5 p-4 shadow-raised">
        <span
          className="flex size-12 flex-none items-center justify-center rounded-tile bg-point-orange/12 text-accent-ink"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-6">
            <path d="M7 3v8a3 3 0 0 0 6 0V3" />
            <path d="M10 11v10" />
            <path d="M18 3c-1.5 2-2 4-2 6s.5 3 2 3v9" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[19px] font-extrabold tracking-tight text-app-text">
            {restaurant.name}
          </p>
          <p className="mt-0.5 truncate text-sm text-ink-soft">
            {restaurant.category
              ? `${restaurant.category} · ${restaurant.roadAddress || restaurant.address}`
              : restaurant.roadAddress || restaurant.address}
          </p>
        </div>
      </Card>

      {/* 주 동작 하나 + 텍스트 보조. 채움 버튼 두 개를 위아래로 쌓지 않는다. */}
      <Button variant="primary" size="lg" fullWidth className="mt-6" onClick={onShowRoute}>
        경로 보기
      </Button>

      <div className="mt-1 w-full">
        <ShareRestaurantButton restaurant={restaurant} />
      </div>
    </div>
  )
}

export default GameResult
