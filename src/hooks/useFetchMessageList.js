import { useState } from 'react'
import { fetchMessageList } from '../api/room'

// 방 채팅 내역 조회를 감싸는 훅
function useFetchMessageList() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetch = async (roomUuid, afterMessageId) => {
    setIsLoading(true)
    setError(null)
    try {
      return await fetchMessageList(roomUuid, afterMessageId)
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { fetch, isLoading, error }
}

export default useFetchMessageList
