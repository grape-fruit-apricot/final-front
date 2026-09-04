// 보물 주머니 격자. 열린 주머니는 연 사람과 당첨 여부를 보여주고, 닫힌 주머니는 눌러서 열 수 있다.
// 어느 주머니가 당첨인지는 서버가 게임이 끝나기 전까지 알려주지 않으므로 여기서는 알 방법이 없다.
function TreasureBagGrid({ bagCount, picks, players, isMyTurn, onPick, isPicking }) {
  const findPick = (bagIndex) => picks.find((pick) => pick.bagIndex === bagIndex)

  const findNickname = (participantId) => {
    const player = players.find(
      (item) => String(item.participantId) === String(participantId)
    )
    return player?.nickname ?? ''
  }

  return (
    <ul className="grid grid-cols-5 gap-2">
      {Array.from({ length: bagCount }, (_, bagIndex) => {
        const pick = findPick(bagIndex)
        const isWinner = pick?.isWinner === 'Y'

        return (
          <li key={bagIndex}>
            <button
              type="button"
              onClick={() => onPick(bagIndex)}
              disabled={!isMyTurn || Boolean(pick) || isPicking}
              className={`flex aspect-square w-full flex-col items-center justify-center rounded-lg text-xs font-semibold disabled:opacity-60 ${
                isWinner
                  ? 'bg-point-orange text-white'
                  : pick
                    ? 'bg-soft-orange text-app-text'
                    : 'bg-white text-app-text'
              }`}
            >
              {pick ? (
                <>
                  <span className="text-base">{isWinner ? '🎉' : '🕳️'}</span>
                  <span className="w-full truncate px-1">{findNickname(pick.participantId)}</span>
                </>
              ) : (
                <span className="text-base">🎁</span>
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export default TreasureBagGrid
