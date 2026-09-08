import Button from './Button'
import Card from './Card'
import ErrorMessage from './ErrorMessage'

// 게임으로 정해진 뒤, 방장이 게임을 열기 전까지의 대기 화면.
// 방장에게는 시작 버튼을, 참가자에게는 무엇을 기다리는지를 보여준다.
// (전에는 참가자 화면에 제목 말고 아무것도 없어 멈춘 것처럼 보였다.)
function GameLobby({
  participants,
  readyPlayerCount,
  isHost,
  isStarting,
  onStart,
  onFallback,
  startError,
  gameError,
}) {
  const canStart = readyPlayerCount >= 2

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-col items-center gap-2 pt-2">
        <span
          className="flex h-16 w-16 items-center justify-center rounded-full bg-point-orange/10 text-3xl"
          aria-hidden="true"
        >
          🎁
        </span>
        <h2 className="text-lg font-bold text-app-text">게임으로 정해졌습니다</h2>
        <p className="text-center text-sm leading-relaxed text-ink-soft">
          보물 주머니에서 당첨을 찾은 사람이
          <br />
          고른 식당으로 정해집니다.
        </p>
      </div>

      {startError && <ErrorMessage message={startError} />}
      {gameError && <ErrorMessage message={gameError} />}

      {/* 누가 참여하는지 보여준다. 대기 시간에 볼 것이 있어야 화면이 비지 않는다. */}
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-sm font-semibold text-ink-soft">참여 인원</h3>
          <p className="text-xs text-ink-soft">{readyPlayerCount}명 참여</p>
        </div>

        {/* 함께 볼 현황이라 줄마다 카드를 두지 않고 한 덩어리 안에서 줄만 나눈다. */}
        <Card as="ul" className="divide-y divide-hairline overflow-hidden">
          {participants.map((participant) => {
            const joins = participant.isHost === 'Y' || participant.isReady === 'Y'

            return (
              <li
                key={participant.participantId}
                className="flex items-center justify-between gap-3 px-4 py-3.5"
              >
                <span className="truncate font-medium text-app-text">
                  {participant.nickname}
                  {participant.isHost === 'Y' && ' (방장)'}
                </span>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    joins
                      ? 'bg-accent-tint text-accent-ink'
                      : 'bg-fill text-ink-soft'
                  }`}
                >
                  {joins ? '참여' : '대기'}
                </span>
              </li>
            )
          })}
        </Card>
      </div>

      <div className="mt-auto flex flex-col gap-2 pt-2">
        {isHost ? (
          <>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={onStart}
              disabled={!canStart || isStarting}
            >
              {isStarting ? '게임 여는 중...' : '게임 시작'}
            </Button>
            <p className="text-center text-xs text-ink-soft">
              {canStart
                ? `방장과 준비를 마친 참가자 ${readyPlayerCount}명이 참여합니다.`
                : '게임을 시작하려면 준비를 마친 참가자가 2명 이상이어야 합니다.'}
            </p>
            <Button variant="neutral" size="md" fullWidth onClick={onFallback} disabled={isStarting}>
              무작위로 진행하기
            </Button>
          </>
        ) : (
          // 참가자는 할 일이 없다. 멈춘 것이 아니라 기다리는 중이라는 것만 알려준다.
          <div className="flex items-center justify-center gap-2 rounded-full bg-fill px-4 py-3.5 text-sm font-medium text-ink-soft">
            <span className="flex h-2 w-2 animate-pulse rounded-full bg-point-orange" aria-hidden="true" />
            방장이 게임을 시작하기를 기다리는 중이에요
          </div>
        )}
      </div>
    </div>
  )
}

export default GameLobby
