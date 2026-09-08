import { useLayoutEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import api from '../../api/api'

// 업무상 400/404(아직 없는 게임·경로 결과 등)는 각 화면에서 처리한다.
export default function ApiErrorNavigation() {
  const location = useLocation()
  const navigate = useNavigate()
  useLayoutEffect(() => {
    let active = true
    const onConnectionError = () => {
      if (!active || location.pathname.startsWith('/error')) return
      active = false
      navigate('/error', { replace: true, state: { from: location.pathname + location.search + location.hash } })
    }
    window.addEventListener('room-connection-error', onConnectionError)
    const id = api.interceptors.response.use(undefined, (error) => {
      const status = error.response?.status
      if (active && !location.pathname.startsWith('/error') && !axios.isCancel(error) && (!error.response || status >= 500)) {
        active = false
        navigate('/error', { replace: true, state: { from: location.pathname + location.search + location.hash } })
      }
      return Promise.reject(error)
    })
    return () => {
      active = false
      api.interceptors.response.eject(id)
      window.removeEventListener('room-connection-error', onConnectionError)
    }
  }, [location, navigate])
  return null
}
