import { useState } from 'react'

// 중간지점 데이터와 찾기·재설정 요청 상태는 이 훅에서만 변경한다.
function useMidpointActions(publish) {
  const [midpoint, setMidpoint] = useState(null)
  const [isFinding, setIsFinding] = useState(false)
  const [findError, setFindError] = useState(null)
  const [isResetting, setIsResetting] = useState(false)
  const [resetError, setResetError] = useState(null)

  // 방장 여부는 서버가 소켓 세션의 participantId로 다시 확인하므로, 여기서는 버튼 노출만 판단한다.
  const handleFindMidpoint = () => {
    setFindError(null);
    setIsFinding(true);

    if (!publish("/app/midpoint/find")) {
      setIsFinding(false);
      setFindError("연결이 끊겼습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const handleResetMidpoint = () => {
    if (isResetting) return;
    if (
      !window.confirm(
        "중간 위치를 재설정하면 모든 참가자의 식당 선택과 준비 상태가 초기화됩니다. 재설정하시겠습니까?",
      )
    ) {
      return;
    }

    setResetError(null);
    setIsResetting(true);
    if (!publish("/app/midpoint/reset")) {
      setIsResetting(false);
      setResetError("연결이 끊겼습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const handleFound = (value) => {
    setMidpoint(value)
    setIsFinding(false)
  }
  const handleReset = (value) => {
    setMidpoint(value)
    setIsResetting(false)
    setResetError(null)
    setFindError(null)
  }
  const handleFindError = (payload) => {
    setFindError(payload?.message ?? '중간지점을 찾지 못했습니다. 잠시 후 다시 시도해주세요.')
    setIsFinding(false)
  }
  const handleResetError = (payload) => {
    setIsResetting(false)
    setResetError(payload?.message ?? '중간 위치를 재설정하지 못했습니다.')
  }

  return {
    state: { data: midpoint, isFinding, findError, isResetting, resetError },
    actions: { onFind: handleFindMidpoint, onReset: handleResetMidpoint },
    events: {
      restore: setMidpoint, found: handleFound, reset: handleReset,
      findError: handleFindError, resetError: handleResetError,
    },
  }
}

export default useMidpointActions
