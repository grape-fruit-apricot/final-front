import { useState } from 'react'
import { createRestaurant } from '../api/room'

// 식당 추가 API 호출과 로딩/에러 상태를 관리하는 훅
function useCreateRestaurant() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const create = async (roomUuid, payload) => {
    setIsLoading(true)
    setError(null)
    try {
      return await createRestaurant(roomUuid, payload)
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { create, isLoading, error }
}

export default useCreateRestaurant
