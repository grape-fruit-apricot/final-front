import { useState } from 'react'
import { updateReady } from '../api/room'

// 준비 완료 API 호출과 로딩/에러 상태를 관리하는 훅
function useUpdateReady() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const update = async (roomUuid, participantId) => {
    setIsLoading(true)
    setError(null)
    try {
      return await updateReady(roomUuid, participantId)
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { update, isLoading, error }
}

export default useUpdateReady
