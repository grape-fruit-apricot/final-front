import api from './api'

// 방 생성 (백엔드가 빈 body도 허용하지 않아 기본값으로 빈 객체를 보낸다)
export function createRoom(payload = {}) {
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

// 참가자 목록 조회
export function fetchParticipantList(roomUuid) {
  return api.get(`/api/rooms/${roomUuid}/participants`)
}

// 중간지점 계산 (방장만 호출 가능, 백엔드에서 participantId로 검증)
export function createMidpoint(roomUuid, participantId) {
  return api.post(`/api/rooms/${roomUuid}/midpoint`, null, { params: { participantId } })
}
