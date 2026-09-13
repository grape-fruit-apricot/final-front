import { useState } from 'react'

// 투표·게임 데이터와 명령 대기 상태를 한곳에서 관리한다.
function useGameActions(publish) {
  const [modeVote, setModeVote] = useState(null)
  const [game, setGame] = useState(null)
  const [isStarting, setIsStarting] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const [isPicking, setIsPicking] = useState(false)
  const [startError, setStartError] = useState(null)
  const [gameError, setGameError] = useState(null)

  // 투표도 식당 고르기와 같은 두 단계다. 누르는 것은 표시만 바꾸고, 표는 확정 바가 보낸다.
  const [pendingMode, setPendingMode] = useState(null)

  // 시작하기는 이제 결과를 바로 확정하지 않고 진행 방식 투표를 연다.
  const handleStart = () => {
    setStartError(null);
    setIsStarting(true);

    if (!publish("/app/mode/start")) {
      setIsStarting(false);
      setStartError("연결이 끊겼습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const handleVote = (voteMode) => {
    setStartError(null);
    setIsVoting(true);

    if (!publish("/app/mode/vote", { voteMode })) {
      setIsVoting(false);
      setStartError("연결이 끊겼습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const handlePickMode = (voteMode) => {
    setStartError(null)
    setPendingMode(voteMode)
  }

  const handleConfirmVote = () => {
    if (pendingMode == null) return
    handleVote(pendingMode)
  }

  const handleStartGame = () => {
    setGameError(null);
    setIsStarting(true);

    if (!publish("/app/game/start")) {
      setIsStarting(false);
      setGameError("연결이 끊겼습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const handlePickBag = (bagIndex) => {
    setGameError(null);
    setIsPicking(true);

    if (!publish("/app/game/pick", { bagIndex })) {
      setIsPicking(false);
      setGameError("연결이 끊겼습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  // 서버에는 차례 타이머가 없다. 시간이 다 되면 화면이 알려준다.
  // 여러 명이 동시에 보내도 서버가 첫 번째만 반영하므로 실패해도 따로 처리하지 않는다.
  const handleExpireTurn = (turnSeq) => {
    publish("/app/game/expire", { turnSeq });
  };

  const handleLeaveGame = () => {
    setGameError(null);

    if (!publish("/app/game/leave")) {
      setGameError("연결이 끊겼습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  // 게임을 못 하거나 중단됐을 때 방을 막아두지 않도록 방장이 무작위로 넘길 수 있게 한다.
  const handleFallbackToRandom = () => {
    setStartError(null);
    setIsStarting(true);

    if (!publish("/app/result/find")) {
      setIsStarting(false);
      setStartError("연결이 끊겼습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const handleMode = (status) => {
    setModeVote(status)
    setIsStarting(false)
    setIsVoting(false)
  }
  const handleModeError = (payload) => {
    setStartError(payload?.message ?? '투표를 처리하지 못했습니다.')
    setIsStarting(false)
    setIsVoting(false)
  }
  const handleGame = (status) => {
    setGame(status)
    setIsPicking(false)
    setIsStarting(false)
  }
  const handleGameError = (payload) => {
    setGameError(payload?.message ?? '게임을 처리하지 못했습니다.')
    setIsPicking(false)
    setIsStarting(false)
  }
  const handleResultError = (payload) => {
    setStartError(payload?.message ?? '결과를 확정하지 못했습니다.')
    setIsStarting(false)
  }

  return {
    state: { modeVote, game, pendingMode, isStarting, isVoting, isPicking, startError, gameError },
    actions: {
      onStart: handleStart, onPickMode: handlePickMode, onConfirmVote: handleConfirmVote,
      onStartGame: handleStartGame, onPickBag: handlePickBag, onExpireTurn: handleExpireTurn,
      onLeaveGame: handleLeaveGame, onFallback: handleFallbackToRandom,
    },
    events: {
      restoreMode: setModeVote, restoreGame: setGame,
      mode: handleMode, modeError: handleModeError, game: handleGame, gameError: handleGameError,
      result: () => setIsStarting(false), resultError: handleResultError,
      reset: () => setStartError(null),
    },
  }
}

export default useGameActions
