import { useState } from 'react'
import { fetchGameStatus } from '../api/room'

// 게임 현황 조회를 감싸는 훅
function useFetchGameStatus() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetch = async (roomUuid) => {
    setIsLoading(true)
    setError(null)
    try {
      return await fetchGameStatus(roomUuid)
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { fetch, isLoading, error }
}

export default useFetchGameStatus
