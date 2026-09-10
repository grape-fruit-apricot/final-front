import { useState } from 'react'
import { fetchSelectionList } from '../api/room'

// 방 전체 식당 선택 현황 조회를 감싸는 훅
function useFetchSelectionList() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetch = async (roomUuid) => {
    setIsLoading(true)
    setError(null)
    try {
      return await fetchSelectionList(roomUuid)
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { fetch, isLoading, error }
}

export default useFetchSelectionList
