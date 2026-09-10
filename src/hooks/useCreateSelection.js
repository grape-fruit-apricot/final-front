import { useState } from 'react'
import { createSelection } from '../api/room'

// 식당 선택 API 호출과 로딩/에러 상태를 관리하는 훅
function useCreateSelection() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const create = async (roomUuid, participantId, restaurantId) => {
    setIsLoading(true)
    setError(null)
    try {
      return await createSelection(roomUuid, participantId, restaurantId)
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { create, isLoading, error }
}

export default useCreateSelection
