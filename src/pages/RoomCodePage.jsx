import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { copyToClipboard } from '../utils/clipboard'
import ErrorMessage from '../components/common/ErrorMessage'

function RoomCodePage() {
  const { roomUuid } = useParams()
  const inviteLink = `${window.location.origin}/join/${roomUuid}`
  const [isCopied, setIsCopied] = useState(false)
  const [copyError, setCopyError] = useState(null)

  const handleCopyLink = async () => {
    try {
      await copyToClipboard(inviteLink)
      setCopyError(null)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
      setCopyError('링크 복사에 실패했습니다. 직접 복사해주세요.')
    }
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <h1 className="text-lg font-semibold text-app-text">방 코드</h1>
      <p className="mt-4 break-all text-2xl font-bold text-main-navy">{roomUuid}</p>
      <p className="mt-2 break-all text-sm text-app-text/70">{inviteLink}</p>
      {copyError && <ErrorMessage message={copyError} />}
      <button
        type="button"
        onClick={handleCopyLink}
        className="mt-4 min-h-11 w-full rounded-lg bg-point-orange font-semibold text-white"
      >
        {isCopied ? '복사됨!' : '링크 복사하기'}
      </button>
    </div>
  )
}

export default RoomCodePage
