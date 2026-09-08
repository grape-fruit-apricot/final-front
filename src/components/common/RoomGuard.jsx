import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom'
import { fetchRoom } from '../../api/room'
import LoadingSpinner from './LoadingSpinner'

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default function RoomGuard() {
  const { roomUuid } = useParams()
  const location = useLocation()
  const valid = uuidPattern.test(roomUuid)
  const [result, setResult] = useState(null)
  useEffect(() => {
    if (!valid) return
    let active = true
    fetchRoom(roomUuid).then(
      (room) => { if (active) setResult({ roomUuid, state: room ? 'ready' : 'missing' }) },
      (error) => { if (active) setResult({ roomUuid, state: [400, 404, 410].includes(error.response?.status) ? 'missing' : 'error' }) },
    )
    return () => { active = false }
  }, [roomUuid, valid])
  if (!valid || (result?.roomUuid === roomUuid && result.state === 'missing')) return <Navigate to="/error/room" replace />
  if (result?.roomUuid !== roomUuid) return <LoadingSpinner />
  if (result.state === 'error') return <Navigate to="/error" replace state={{ from: location.pathname + location.search + location.hash }} />
  return <Outlet />
}
