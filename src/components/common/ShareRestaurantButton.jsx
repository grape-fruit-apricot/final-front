import { useState } from 'react'
import { shareRestaurant } from '../../utils/shareRestaurant'
import ErrorMessage from './ErrorMessage'

// 최종 선정된 식당을 방 참가자가 아닌 외부(카톡 등)로 공유하는 버튼.
function ShareRestaurantButton({ restaurant }) {
  const [status, setStatus] = useState(null) // 'copied' | 'error' | null

  const handleShare = async () => {
    setStatus(null)
    try {
      const result = await shareRestaurant(restaurant)
      if (result === 'copied') {
        setStatus('copied')
        setTimeout(() => setStatus(null), 2000)
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleShare}
        className="min-h-11 w-full rounded-lg bg-point-orange font-semibold text-white"
      >
        {status === 'copied' ? '링크 복사됨!' : '식당 공유하기'}
      </button>
      {status === 'error' && <ErrorMessage message="공유하지 못했습니다." />}
    </div>
  )
}

export default ShareRestaurantButton
