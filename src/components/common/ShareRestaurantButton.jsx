import { useState } from 'react'
import { shareRestaurant } from '../../utils/shareRestaurant'
import Button from './Button'
import ErrorMessage from './ErrorMessage'

// 최종 선정된 식당을 방 참가자가 아닌 외부(카톡 등)로 공유하는 버튼.
// 결과 화면의 주 동작은 "경로 보기"라, 같은 채움 버튼이 두 개 겹치지 않도록 텍스트형으로 둔다.
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
      <Button variant="plain" fullWidth onClick={handleShare}>
        {status === 'copied' ? '링크 복사됨!' : '식당 공유하기'}
      </Button>
      {status === 'error' && <ErrorMessage message="공유하지 못했습니다." />}
    </div>
  )
}

export default ShareRestaurantButton
