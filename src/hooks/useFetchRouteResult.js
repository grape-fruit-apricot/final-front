import { useState } from 'react'
import { fetchRouteResult } from '../api/room'

// 확정된 결과 조회를 감싸는 훅
function useFetchRouteResult() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetch = async (roomUuid, travelMode = 'WALK') => {
    setIsLoading(true)
    setError(null)
    try {
      return await fetchRouteResult(roomUuid, travelMode)
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { fetch, isLoading, error }
}

export default useFetchRouteResult
