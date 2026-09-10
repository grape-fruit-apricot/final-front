import { useState } from 'react'
import { fetchRouteResult } from '../api/room'

// 확정된 결과 조회를 감싸는 훅
function useFetchRouteResult() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // 기본 이동수단은 api/room.js 한 곳에서만 정한다. 여기서 또 정하면 그쪽을 가린다.
  const fetch = async (roomUuid, travelMode) => {
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
