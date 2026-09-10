import { Navigate, useLocation } from 'react-router-dom'

export default function ErrorRedirect({ roomMissing = false }) {
  const location = useLocation()
  return <Navigate to={roomMissing ? '/error/room' : '/error'} replace state={{ from: location.pathname + location.search + location.hash }} />
}
