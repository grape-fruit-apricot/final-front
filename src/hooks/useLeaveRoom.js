import { useState } from 'react'
import { deleteParticipant } from '../api/room'

// 방 나가기를 감싸는 훅
function useLeaveRoom() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const leave = async (roomUuid, participantId) => {
    setIsLoading(true)
    setError(null)
    try {
      return await deleteParticipant(roomUuid, participantId)
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { leave, isLoading, error }
}

export default useLeaveRoom
