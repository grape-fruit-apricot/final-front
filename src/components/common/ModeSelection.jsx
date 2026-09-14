import ModeVote from './ModeVote'
import GameLobby from './GameLobby'
import ErrorMessage from './ErrorMessage'

// 진행 방식 투표와 결정된 방식에 따른 대기 화면을 묶는다.
function ModeSelection({ participants, myParticipantId, readyPlayerCount, isHost, game }) {
  const {
    modeVote, isStarting, isVoting, pendingMode, startError, gameError,
    onStartGame, onFallback, onPickMode,
  } = game

  // 자식의 flex-1에 남은 높이가 전달되도록 바깥 레이아웃도 유지한다.
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {modeVote.decidedMode === 'GAME' ? (
        <GameLobby
          participants={participants}
          readyPlayerCount={readyPlayerCount}
          isHost={isHost}
          isStarting={isStarting}
          onStart={onStartGame}
          onFallback={onFallback}
          startError={startError}
          gameError={gameError}
        />
      ) : modeVote.decidedMode === 'RANDOM' ? (
        <>
          {startError && <ErrorMessage message={startError} />}
          {gameError && <ErrorMessage message={gameError} />}
          <p className="text-center text-[15px] text-ink-soft">무작위로 정하는 중입니다...</p>
        </>
      ) : (
        <>
          {startError && <ErrorMessage message={startError} />}
          {gameError && <ErrorMessage message={gameError} />}
          <ModeVote
            status={modeVote}
            participants={participants}
            myParticipantId={myParticipantId}
            pickedMode={pendingMode}
            onPick={onPickMode}
            isVoting={isVoting}
          />
        </>
      )}
    </div>
  )
}

export default ModeSelection
