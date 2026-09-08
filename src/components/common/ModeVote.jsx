import Card from './Card'
import EmptyState from './EmptyState'

// 게임으로 정할지 무작위로 정할지 참가자들이 한 표씩 던지는 화면.
// 전원이 투표하면 서버가 집계해 알려주므로 여기서는 결과를 계산하지 않는다.

// 고르는 순간이라 선택지를 알약 버튼이 아니라 카드로 둔다.
// 각 방식이 무엇을 뜻하는지 한 줄로 붙여야 처음 보는 사람이 고를 수 있다.
const MODES = [
  {
    value: 'GAME',
    label: '게임으로',
    description: '보물 주머니를 열어 한 명을 뽑아요',
    icon: (
      <>
        <path d="M20 12v9H4v-9" />
        <path d="M2 7h20v5H2z" />
        <path d="M12 21V7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7Z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7Z" />
      </>
    ),
  },
  {
    value: 'RANDOM',
    label: '무작위로',
    description: '고른 식당 중에서 바로 정해요',
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="4" />
        <circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="15.5" cy="15.5" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
      </>
    ),
  },
]

// pickedMode / onPick: 식당 고르기와 같은 두 단계다. 여기서 누르는 것은 표시만 바꾸고,
// 서버로 보내는 것은 화면 아래에서 올라오는 확정 버튼이 맡는다(MainPage).
// 눌리자마자 표가 나가면 잘못 눌렀을 때 되돌릴 방법이 없다.
function ModeVote({ status, participants, myParticipantId, pickedMode, onPick, isVoting }) {
  const { votes, totalCount } = status

  const myVote = votes.find(
    (vote) => String(vote.participantId) === String(myParticipantId)
  )

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-center text-subhead font-extrabold text-app-text">어떻게 정할까요?</h2>
        <p className="text-center text-xs leading-relaxed text-ink-soft">
          {votes.length}/{totalCount}명 투표 완료 · 동점이면 방장이 고른 쪽으로 정해집니다
        </p>
      </div>

      {/* 선택지가 둘뿐이라 나란히 두면 화면 위쪽에 작게 몰리고 아래가 통째로 빈다.
          위아래로 쌓고 flex-1 로 남은 높이를 나눠 가져, 고르는 순간이 화면의 주인공이 되게 한다. */}
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {MODES.map((mode) => {
          // 아직 아무것도 누르지 않았으면 이미 던진 표를 눌러둔 것으로 본다.
          // 그래야 바꾸러 들어왔을 때 무엇을 바꾸는지 보인다.
          const isPicked = (pickedMode ?? myVote?.voteMode) === mode.value

          return (
            <button
              key={mode.value}
              type="button"
              onClick={() => onPick(mode.value)}
              disabled={isVoting}
              aria-pressed={isPicked}
              className={`flex min-h-32 flex-1 flex-col items-center justify-center gap-3 rounded-card border px-4 py-6 transition-colors ${
                isPicked
                  ? 'border-point-orange bg-accent-tint shadow-raised'
                  : 'border-edge bg-surface shadow-surface'
              }`}
            >
              <span
                className={`flex h-16 w-16 items-center justify-center rounded-full ${
                  isPicked ? 'bg-point-orange text-white' : 'bg-fill text-ink-soft'
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-8 w-8"
                  aria-hidden="true"
                >
                  {mode.icon}
                </svg>
              </span>
              <span
                className={`text-subhead font-extrabold ${isPicked ? 'text-accent-ink' : 'text-app-text'}`}
              >
                {mode.label}
              </span>
              <span className="text-center text-sm leading-snug text-ink-soft">
                {mode.description}
              </span>
            </button>
          )
        })}
      </div>

      {myVote && (
        <p className="text-center text-xs text-ink-soft">
          다른 참가자를 기다리는 중이에요. 다시 골라 바꿀 수 있어요.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-ink-soft">투표 현황</h3>
        {participants.length === 0 ? (
          <EmptyState message="참가자가 없습니다." />
        ) : (
          <Card as="ul" className="divide-y divide-hairline overflow-hidden">
            {participants.map((participant) => {
              const vote = votes.find(
                (item) => String(item.participantId) === String(participant.participantId)
              )

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
                      vote
                        ? 'bg-accent-tint text-accent-ink'
                        : 'bg-fill text-ink-soft'
                    }`}
                  >
                    {toVoteLabel(vote)}
                  </span>
                </li>
              )
            })}
          </Card>
        )}
      </div>
    </div>
  )
}

// 누가 무엇에 투표했는지는 모두에게 공개된다(동점 시 방장 표로 정해지는 규칙 때문에 필요하다).
function toVoteLabel(vote) {
  if (!vote) return '아직'
  return vote.voteMode === 'GAME' ? '게임' : '무작위'
}

export default ModeVote
