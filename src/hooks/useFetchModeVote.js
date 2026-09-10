import { useState } from 'react'
import { fetchModeVoteStatus } from '../api/room'

// 진행 방식 투표 현황 조회를 감싸는 훅
function useFetchModeVote() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetch = async (roomUuid) => {
    setIsLoading(true)
    setError(null)
    try {
      return await fetchModeVoteStatus(roomUuid)
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { fetch, isLoading, error }
}

export default useFetchModeVote
