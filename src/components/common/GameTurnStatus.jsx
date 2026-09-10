import ListGroup from './ListGroup'
import EmptyState from './EmptyState'

// 현재 차례와 남은 시간, 참가자별 상태를 보여준다.
// 목록 레이아웃은 ParticipantSelectionList 와 같은 방식을 쓴다.
function GameTurnStatus({ status, myParticipantId, remainingSeconds }) {
  const { players, currentParticipantId } = status

  const isMyTurn = String(currentParticipantId) === String(myParticipantId)
  const currentPlayer = players.find(
    (player) => String(player.participantId) === String(currentParticipantId)
  )

  return (
    <div className="flex flex-col gap-3">
      {status.status === 'PLAYING' && (
        <div className="text-center">
          <p className="text-[15px] font-bold text-ink-soft">
            {isMyTurn ? '내 차례입니다' : `${currentPlayer?.nickname ?? '...'} 님의 차례`}
          </p>
          {/* 남은 시간이 이 화면에서 제일 급한 정보라 제일 크게 둔다. */}
          <p className="mt-0.5 text-display font-extrabold text-point-orange" data-numeric>
            {remainingSeconds}초
          </p>
        </div>
      )}

      {players.length === 0 ? (
        <EmptyState message="참가자가 없습니다." />
      ) : (
        <ListGroup>
          {players.map((player) => {
            const isCurrent = String(player.participantId) === String(currentParticipantId)

            return (
              <div
                key={player.participantId}
                className={`flex min-h-14 items-center justify-between gap-4 px-4 py-3 ${
                  isCurrent ? 'bg-accent-tint' : ''
                }`}
              >
                <span className="truncate text-[17px] font-bold tracking-tight text-app-text">
                  {player.nickname}
                  {player.isHost === 'Y' && ' (방장)'}
                </span>
                <span
                  className={`shrink-0 text-[15px] font-bold ${
                    player.isWinner === 'Y' ? 'text-accent-ink' : 'text-ink-soft'
                  }`}
                >
                  {toPlayerLabel(player)}
                </span>
              </div>
            )
          })}
        </ListGroup>
      )}
    </div>
  )
}

function toPlayerLabel(player) {
  if (player.isWinner === 'Y') {
    return '당첨'
  }
  if (player.isLeft === 'Y') {
    return '나감'
  }
  return `${player.turnOrder + 1}번`
}

export default GameTurnStatus
