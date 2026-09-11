import { useState } from 'react'
import { fetchTracking } from '../api/room'

// 이동 추적 현황 조회를 감싸는 훅
function useFetchTracking() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetch = async (roomUuid) => {
    setIsLoading(true)
    setError(null)
    try {
      return await fetchTracking(roomUuid)
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { fetch, isLoading, error }
}

export default useFetchTracking
