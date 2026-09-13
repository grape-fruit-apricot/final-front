import { useState } from 'react'
import { createParticipant } from '../api/room'

// 방 참가 API 호출과 로딩/에러 상태를 관리하는 훅
function useJoinRoom() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const join = async (roomUuid, payload) => {
    setIsLoading(true)
    setError(null)
    try {
      return await createParticipant(roomUuid, payload)
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { join, isLoading, error }
}

export default useJoinRoom
