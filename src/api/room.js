import api from './api'

// 방 생성
export function createRoom(payload) {
  return api.post('/api/rooms', payload)
}

// 방 코드(roomUuid)로 방 조회
export function fetchRoom(roomUuid) {
  return api.get(`/api/rooms/${roomUuid}`)
}

// 방 참가
export function joinRoom(roomUuid, payload) {
  return api.post(`/api/rooms/${roomUuid}/participants`, payload)
}
