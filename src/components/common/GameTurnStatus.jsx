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
          <p className="font-semibold text-white">
            {isMyTurn ? '내 차례입니다' : `${currentPlayer?.nickname ?? '...'} 님의 차례`}
          </p>
          <p className="text-2xl font-bold text-point-orange">{remainingSeconds}초</p>
        </div>
      )}

      {players.length === 0 ? (
        <EmptyState message="참가자가 없습니다." />
      ) : (
        <ul className="flex flex-col gap-2">
          {players.map((player) => (
            <li
              key={player.participantId}
              className="flex items-center justify-between gap-4 text-white"
            >
              <span
                className={`truncate ${
                  String(player.participantId) === String(currentParticipantId)
                    ? 'text-point-orange'
                    : 'text-white'
                }`}
              >
                {player.nickname}
                {player.isHost === 'Y' && ' (방장)'}
              </span>
              <span className="shrink-0 text-white/80">{toPlayerLabel(player)}</span>
            </li>
          ))}
        </ul>
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
