import { useState } from 'react'
import { createRoom } from '../api/room'

// 방 생성 API 호출과 로딩/에러 상태를 관리하는 훅
function useCreateRoom() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const create = async () => {
    setIsLoading(true)
    setError(null)
    try {
      return await createRoom()
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { create, isLoading, error }
}

export default useCreateRoom
