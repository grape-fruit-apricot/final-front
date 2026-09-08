// InvalidStateException과 입력 검증 오류가 모두 400이므로 참가 API의 사유도 확인한다.
const admissionMessages = new Set([
  '이미 시작된 방이라 입장할 수 없습니다.',
  '방 인원이 가득 찼습니다.',
])

export function classifyJoinRoomError(error) {
  const status = error.response?.status
  const message = error.response?.data?.message
  if ([404, 410].includes(status)) return { path: '/error/room' }
  if (status === 400 && admissionMessages.has(message)) {
    return { path: '/error/join', reason: message }
  }
  if ([401, 403].includes(status)) {
    return { path: '/error/join', reason: '이 방에 참가할 권한이 없습니다.' }
  }
  if (!status || status >= 500) return { path: '/error' }
  if (status === 409) return { message: '이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해 주세요.' }
  return { message: typeof message === 'string' && message.trim() ? message : '참가하지 못했어요. 입력 내용을 확인하고 다시 시도해 주세요.' }
}
