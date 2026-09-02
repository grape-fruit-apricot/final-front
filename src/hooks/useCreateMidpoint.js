import { useState } from 'react'
import { createMidpoint } from '../api/room'

// 중간지점 계산 API 호출과 로딩/에러 상태를 관리하는 훅
function useCreateMidpoint() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const create = async (roomUuid) => {
    setIsLoading(true)
    setError(null)
    try {
      return await createMidpoint(roomUuid)
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { create, isLoading, error }
}

export default useCreateMidpoint
