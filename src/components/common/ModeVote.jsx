import EmptyState from './EmptyState'

// 게임으로 정할지 무작위로 정할지 참가자들이 한 표씩 던지는 화면.
// 전원이 투표하면 서버가 집계해 알려주므로 여기서는 결과를 계산하지 않는다.
function ModeVote({ status, participants, myParticipantId, onVote, isVoting }) {
  const { votes, totalCount } = status

  const myVote = votes.find(
    (vote) => String(vote.participantId) === String(myParticipantId)
  )

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-center font-semibold text-white">어떻게 정할까요?</h2>
      <p className="text-center text-sm text-white/70">
        {votes.length}/{totalCount}명 투표 완료 · 동점이면 방장이 고른 쪽으로 정해집니다
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onVote('GAME')}
          disabled={isVoting}
          className={`min-h-11 flex-1 rounded-lg font-semibold disabled:opacity-60 ${
            myVote?.voteMode === 'GAME'
              ? 'bg-point-orange text-white'
              : 'bg-white text-app-text'
          }`}
        >
          게임으로 정하기
        </button>
        <button
          type="button"
          onClick={() => onVote('RANDOM')}
          disabled={isVoting}
          className={`min-h-11 flex-1 rounded-lg font-semibold disabled:opacity-60 ${
            myVote?.voteMode === 'RANDOM'
              ? 'bg-point-orange text-white'
              : 'bg-white text-app-text'
          }`}
        >
          무작위로 정하기
        </button>
      </div>

      {myVote && (
        <p className="text-center text-sm text-white/70">
          다른 참가자를 기다리는 중입니다. 다시 눌러 바꿀 수 있습니다.
        </p>
      )}

      <h3 className="mt-2 font-semibold text-white">투표 현황</h3>
      {participants.length === 0 ? (
        <EmptyState message="참가자가 없습니다." />
      ) : (
        <ul className="flex flex-col gap-2">
          {participants.map((participant) => {
            const vote = votes.find(
              (item) => String(item.participantId) === String(participant.participantId)
            )

            return (
              <li
                key={participant.participantId}
                className="flex items-center justify-between gap-4 text-white"
              >
                <span className="truncate">
                  {participant.nickname}
                  {participant.isHost === 'Y' && ' (방장)'}
                </span>
                <span className="shrink-0 text-white/80">{toVoteLabel(vote)}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

// 누가 무엇에 투표했는지는 모두에게 공개된다(동점 시 방장 표로 정해지는 규칙 때문에 필요하다).
function toVoteLabel(vote) {
  if (!vote) return '아직'
  return vote.voteMode === 'GAME' ? '게임' : '무작위'
}

export default ModeVote
