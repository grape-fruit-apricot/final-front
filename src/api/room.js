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

// 방에 저장된 식당 목록 조회 (중간지점 확정 시 자동 수집된 것 + 참가자가 추가한 것)
export function fetchRestaurantList(roomUuid) {
  return api.get(`/api/rooms/${roomUuid}/restaurants`)
}

// 참가자가 검색해서 찾은 식당을 방 목록에 추가
export function createRestaurant(roomUuid, payload) {
  return api.post(`/api/rooms/${roomUuid}/restaurants`, payload)
}

// 확정된 결과(선정 식당 + 참가자별 경로) 조회. 확정 전에는 404가 돌아온다.
// 확정된 식당은 걸어가기엔 먼 경우가 많아 대중교통을 기본으로 본다.
// 화면(MainPage)의 초기 이동수단과 어긋나면 도착한 경로가 걸러져 목록이 비므로
// 두 곳이 이 상수 하나를 같이 쓴다.
export const DEFAULT_TRAVEL_MODE = 'TRANSIT'

export function fetchRouteResult(roomUuid, travelMode = DEFAULT_TRAVEL_MODE) {
  return api.get(`/api/rooms/${roomUuid}/routes`, {
    params: { travelMode },
  })
}

// 진행 방식(게임/무작위) 투표 현황 조회. 투표 자체는 소켓으로만 보낸다.
export function fetchModeVoteStatus(roomUuid) {
  return api.get(`/api/rooms/${roomUuid}/votes`)
}

// 게임 시작 전 준비 상태 토글. 서버가 현재 값을 뒤집으므로 보낼 값이 없다.
export function updateReady(roomUuid, participantId) {
  return api.patch(`/api/rooms/${roomUuid}/participants/${participantId}/ready`)
}

// 방 전체의 식당 선택 현황 조회
export function fetchSelectionList(roomUuid) {
  return api.get(`/api/rooms/${roomUuid}/selections`)
}

// 참가자가 식당 하나를 선택 (다시 선택하면 기존 선택을 대체)
export function createSelection(roomUuid, participantId, restaurantId) {
  return api.post(`/api/rooms/${roomUuid}/participants/${participantId}/selection`, { restaurantId })
}

// 방 채팅 내역 조회. afterMessageId 를 주면 그 이후 메시지만 (재연결 후 놓친 구간 따라잡기용)
export function fetchMessageList(roomUuid, afterMessageId) {
  return api.get(`/api/rooms/${roomUuid}/messages`, {
    params: afterMessageId ? { afterMessageId } : undefined,
  })
}

// 게임 현황 조회. 새로고침이나 재접속에서 진행 중인 게임을 복원할 때 쓴다
// (시작·선택·만료·나가기는 소켓으로만 보낸다)
export function fetchGameStatus(roomUuid) {
  return api.get(`/api/rooms/${roomUuid}/games`)
}

// 방에서 나가기. 게임 중에는 서버가 거절하므로 그때는 소켓의 /app/game/leave 를 쓴다
export function deleteParticipant(roomUuid, participantId) {
  return api.delete(`/api/rooms/${roomUuid}/participants/${participantId}`)
}
