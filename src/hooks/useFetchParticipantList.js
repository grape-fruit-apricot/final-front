import { useState } from 'react'
import { fetchParticipantList } from '../api/room'

// 참가자 목록 최초 조회를 감싸는 훅
function useFetchParticipantList() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetch = async (roomUuid) => {
    setIsLoading(true)
    setError(null)
    try {
      return await fetchParticipantList(roomUuid)
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { fetch, isLoading, error }
}

export default useFetchParticipantList
