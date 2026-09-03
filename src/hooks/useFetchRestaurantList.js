import { useState } from 'react'
import { fetchRestaurantList } from '../api/room'

// 방의 식당 목록 조회를 감싸는 훅
function useFetchRestaurantList() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetch = async (roomUuid) => {
    setIsLoading(true)
    setError(null)
    try {
      return await fetchRestaurantList(roomUuid)
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { fetch, isLoading, error }
}

export default useFetchRestaurantList
