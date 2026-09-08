// 보물 주머니 격자. 열린 주머니는 연 사람과 당첨 여부를 보여주고, 닫힌 주머니는 눌러서 열 수 있다.
// 어느 주머니가 당첨인지는 서버가 게임이 끝나기 전까지 알려주지 않으므로 여기서는 알 방법이 없다.
//
// 아이콘은 이모지가 아니라 벡터로 그린다. 이모지는 기기마다 모양과 크기가 달라
// 격자가 안드로이드와 아이폰에서 다르게 보인다.
function TreasureBagGrid({ bagCount, picks, players, isMyTurn, onPick, isPicking }) {
  const findPick = (bagIndex) => picks.find((pick) => pick.bagIndex === bagIndex)

  const findNickname = (participantId) => {
    const player = players.find((item) => String(item.participantId) === String(participantId))
    return player?.nickname ?? ''
  }

  return (
    <ul className="grid grid-cols-5 gap-2">
      {Array.from({ length: bagCount }, (_, bagIndex) => {
        const pick = findPick(bagIndex)
        const isWinner = pick?.isWinner === 'Y'

        // 이미 열린 주머니는 흐리게 하지 않는다. 정보를 보여주는 칸이기 때문이다.
        // 대신 아직 안 열렸는데 내 차례가 아닌 칸만 흐리게 해 "지금은 못 누른다"를 알린다.
        return (
          <li key={bagIndex}>
            <button
              type="button"
              onClick={() => onPick(bagIndex)}
              disabled={!isMyTurn || Boolean(pick) || isPicking}
              aria-label={
                pick
                  ? `${bagIndex + 1}번 주머니 · ${findNickname(pick.participantId)}${isWinner ? ' 당첨' : ''}`
                  : `${bagIndex + 1}번 주머니 열기`
              }
              className={`flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-tile border text-[10px] font-bold transition-[transform,opacity] duration-150 enabled:active:scale-95 ${
                isWinner
                  ? 'border-point-orange bg-point-orange text-white'
                  : pick
                    ? 'border-transparent bg-fill text-ink-faint'
                    : `border-edge bg-surface text-app-text shadow-surface ${isMyTurn ? '' : 'opacity-50'}`
              }`}
            >
              {pick ? (
                <>
                  {isWinner ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
                      <path d="M5 12.5 10 17.5 19 7" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5" aria-hidden="true">
                      <circle cx="12" cy="12" r="7.5" strokeDasharray="3 3" />
                    </svg>
                  )}
                  <span className="w-full truncate px-0.5">{findNickname(pick.participantId)}</span>
                </>
              ) : (
                // 닫힌 주머니. 매듭이 묶인 자루 모양.
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="size-6 text-accent-ink" aria-hidden="true">
                  <path d="M9 7 12 3l3 4" />
                  <path d="M8.5 7h7l2.6 6.4a6.5 6.5 0 0 1-6 9.1h-.2a6.5 6.5 0 0 1-6-9.1L8.5 7Z" />
                </svg>
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export default TreasureBagGrid
