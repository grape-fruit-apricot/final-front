import { useEffect, useRef, useState } from 'react'
import { copyToClipboard } from '../../utils/clipboard'
import Button from './Button'
import Card from './Card'
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
    <Card as="section" className="p-5 text-center">
      <h2 className="text-xs font-extrabold tracking-[0.16em] text-accent-ink">방이 만들어졌어요</h2>

      {/* 방 코드가 이 카드의 주인공이다. 남에게 불러줘야 하는 값이라 크고 또렷하게. */}
      <p className="mt-3 break-all text-2xl font-extrabold tracking-tight text-app-text" data-numeric>
        {roomUuid}
      </p>
      <p className="mt-3 break-all rounded-tile bg-fill px-3 py-2 text-xs text-ink-soft">
        {inviteLink}
      </p>

      {copyError && <ErrorMessage message={copyError} />}

      {/* 이 화면의 주 동작은 중간지점 찾기라 그쪽에 채움 버튼을 양보한다. */}
      <Button variant="secondary" fullWidth className="mt-4" onClick={handleCopyLink}>
        {isCopied ? '복사됨!' : '링크 복사하기'}
      </Button>
    </Card>
  )
}

export default RoomCodeCard
