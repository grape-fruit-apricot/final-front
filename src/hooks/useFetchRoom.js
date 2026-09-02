import { useState } from 'react'
import { fetchRoom } from '../api/room'

// 방 코드(roomUuid)로 방이 존재하는지 확인하는 훅
function useFetchRoom() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetch = async (roomUuid) => {
    setIsLoading(true)
    setError(null)
    try {
      return await fetchRoom(roomUuid)
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { fetch, isLoading, error }
}

export default useFetchRoom
