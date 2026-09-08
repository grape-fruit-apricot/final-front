import ListGroup from './ListGroup'
import EmptyState from './EmptyState'

const VOTE_OPTIONS = [
  { value: 'GAME', label: '게임으로 정하기' },
  { value: 'RANDOM', label: '무작위로 정하기' },
]

// 게임으로 정할지 무작위로 정할지 참가자들이 한 표씩 던지는 화면.
// 전원이 투표하면 서버가 집계해 알려주므로 여기서는 결과를 계산하지 않는다.
function ModeVote({ status, participants, myParticipantId, onVote, isVoting }) {
  const { votes, totalCount } = status

  const myVote = votes.find(
    (vote) => String(vote.participantId) === String(myParticipantId)
  )

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-center text-subhead font-extrabold text-app-text">어떻게 정할까요?</h2>
      <p className="text-center text-sm text-ink-soft">
        {votes.length}/{totalCount}명 투표 완료 · 동점이면 방장이 고른 쪽으로 정해집니다
      </p>

      {/* 두 선택지의 무게가 같으므로 채움 버튼 하나를 고르는 게 아니라
          고른 쪽만 채워지는 선택 카드 두 장으로 둔다. */}
      <div className="grid grid-cols-2 gap-2">
        {VOTE_OPTIONS.map((option) => {
          const isSelected = myVote?.voteMode === option.value

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onVote(option.value)}
              disabled={isVoting}
              aria-pressed={isSelected}
              className={`min-h-14 rounded-card border text-[15px] font-bold tracking-tight transition-[background-color,border-color,transform] duration-150 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-point-orange disabled:pointer-events-none disabled:opacity-40 ${
                isSelected
                  ? 'border-point-orange bg-point-orange text-white'
                  : 'border-edge bg-surface text-app-text shadow-surface'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      {myVote && (
        <p className="text-center text-sm text-ink-soft">
          다른 참가자를 기다리는 중입니다. 다시 눌러 바꿀 수 있습니다.
        </p>
      )}

      {participants.length === 0 ? (
        <EmptyState message="참가자가 없습니다." />
      ) : (
        <ListGroup title="투표 현황" className="mt-2">
          {participants.map((participant) => {
            const vote = votes.find(
              (item) => String(item.participantId) === String(participant.participantId)
            )

            return (
              <div
                key={participant.participantId}
                className="flex min-h-14 items-center justify-between gap-4 px-4 py-3"
              >
                <span className="truncate text-[17px] font-bold tracking-tight text-app-text">
                  {participant.nickname}
                  {participant.isHost === 'Y' && ' (방장)'}
                </span>
                <span
                  className={`shrink-0 text-[15px] font-bold ${vote ? 'text-app-text' : 'text-ink-faint'}`}
                >
                  {toVoteLabel(vote)}
                </span>
              </div>
            )
          })}
        </ListGroup>
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
