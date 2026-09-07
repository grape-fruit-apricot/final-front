import { useEffect, useRef, useState } from 'react'
import { copyToClipboard } from '../../utils/clipboard'
import ErrorMessage from './ErrorMessage'

// 방 코드와 초대 링크를 보여주고 링크를 복사하는 카드.
// 사람을 모으는 단계에서만 쓰이므로 중간지점을 찾으면 화면에서 사라진다.
function RoomCodeCard({ roomUuid }) {
  const inviteLink = `${window.location.origin}/join/${roomUuid}`
  const [isCopied, setIsCopied] = useState(false)
  const [copyError, setCopyError] = useState(null)
  const copiedTimerRef = useRef(null)

  // 타이머를 붙잡아두지 않으면 연달아 복사했을 때 먼저 걸어둔 타이머가 남아 있다가
  // "복사됨!"을 예정보다 일찍 지운다. 화면을 떠날 때도 정리해야 한다.
  useEffect(() => {
    return () => clearTimeout(copiedTimerRef.current)
  }, [])

  const handleCopyLink = async () => {
    try {
      await copyToClipboard(inviteLink)
      setCopyError(null)
      setIsCopied(true)

      clearTimeout(copiedTimerRef.current)
      copiedTimerRef.current = setTimeout(() => setIsCopied(false), 2000)
    } catch {
      setCopyError('링크 복사에 실패했습니다. 직접 복사해주세요.')
    }
  }

  return (
    <section className="rounded-2xl bg-white p-4 text-center">
      <h2 className="font-semibold text-app-text">방이 만들어졌어요!</h2>

      <p className="mt-3 break-all rounded-xl border-2 border-main-navy/20 px-3 py-3 text-xl font-bold text-main-navy">
        {roomUuid}
      </p>
      <p className="mt-2 break-all rounded-lg border border-main-navy/15 px-3 py-2 text-xs text-app-text/70">
        {inviteLink}
      </p>

      {copyError && <ErrorMessage message={copyError} />}

      {/* 이 화면의 주 동작은 중간지점 찾기라 그쪽에 포인트 색을 양보한다. */}
      <button
        type="button"
        onClick={handleCopyLink}
        className="mt-3 min-h-11 w-full rounded-lg bg-main-navy font-semibold text-white"
      >
        {isCopied ? '복사됨!' : '링크 복사하기'}
      </button>
    </section>
  )
}

export default RoomCodeCard
