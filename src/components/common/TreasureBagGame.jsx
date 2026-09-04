import { useEffect, useRef, useState } from 'react'
import ErrorMessage from './ErrorMessage'
import GameTurnStatus from './GameTurnStatus'
import TreasureBagGrid from './TreasureBagGrid'

// 보물 주머니 게임 화면.
// 남은 시간은 서버가 준 값에서 시작해 여기서 1초씩 깎는다. Date.now() 로 계산하면
// 기기 시계가 어긋난 사람만 다른 시간을 보게 되므로 쓰지 않는다.
// 서버에는 차례 타이머가 없고, 시간이 다 되면 이 화면이 알려주는 구조다.
function TreasureBagGame({
  status,
  myParticipantId,
  onPick,
  onExpire,
  onLeave,
  isPicking,
  errorMessage,
}) {
  const [remainingSeconds, setRemainingSeconds] = useState(status.remainingSeconds)
  const tickTimerRef = useRef(null)
  const expiredTurnRef = useRef(null)

  const isPlaying = status.status === 'PLAYING'
  const isMyTurn = isPlaying && String(status.currentParticipantId) === String(myParticipantId)
  const me = status.players.find(
    (player) => String(player.participantId) === String(myParticipantId)
  )
  const hasLeft = me?.isLeft === 'Y'

  // 화면을 떠날 때 타이머를 남겨두지 않는다.
  useEffect(() => {
    return () => clearInterval(tickTimerRef.current)
  }, [])

  // 차례가 바뀔 때마다 서버가 준 남은 시간으로 다시 맞춘다.
  // 다시 걸기 전에 항상 이전 타이머를 지운다.
  useEffect(() => {
    clearInterval(tickTimerRef.current)

    if (!isPlaying) {
      setRemainingSeconds(0)
      return undefined
    }

    setRemainingSeconds(status.remainingSeconds)
    tickTimerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)

    return () => clearInterval(tickTimerRef.current)
  }, [isPlaying, status.turnSeq, status.remainingSeconds])

  // 시간이 다 되면 서버에 알린다. 한 차례에 한 번만 보낸다.
  // 여러 사람이 동시에 보내도 서버가 첫 번째만 반영하므로 중복은 문제되지 않는다.
  useEffect(() => {
    if (!isPlaying || remainingSeconds > 0) {
      return
    }
    if (expiredTurnRef.current === status.turnSeq) {
      return
    }
    expiredTurnRef.current = status.turnSeq
    onExpire(status.turnSeq)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, remainingSeconds, status.turnSeq])

  const winner = status.players.find((player) => player.isWinner === 'Y')

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <h2 className="font-semibold text-white">보물 주머니</h2>
        <p className="mt-1 text-sm text-white/70">
          {status.status === 'FINISHED'
            ? `${winner?.nickname ?? '누군가'} 님이 당첨 주머니를 찾았습니다!`
            : status.status === 'ABORTED'
              ? '게임이 중단되었습니다.'
              : '당첨 주머니를 고르면 그 사람이 고른 식당으로 정해집니다.'}
        </p>
      </div>

      {errorMessage && <ErrorMessage message={errorMessage} />}

      <GameTurnStatus
        status={status}
        myParticipantId={myParticipantId}
        remainingSeconds={remainingSeconds}
      />

      <TreasureBagGrid
        bagCount={status.bagCount}
        picks={status.picks}
        players={status.players}
        isMyTurn={isMyTurn && !hasLeft}
        onPick={onPick}
        isPicking={isPicking}
      />

      {/* 게임이 시작된 뒤 들어온 사람은 players 에 없어 모든 주머니가 잠긴다(관전). 의도된 동작이다. */}
      {isPlaying && me && !hasLeft && (
        <button
          type="button"
          onClick={onLeave}
          className="min-h-11 w-full rounded-lg bg-white/10 font-semibold text-white/80"
        >
          게임에서 나가기
        </button>
      )}
    </div>
  )
}

export default TreasureBagGame
