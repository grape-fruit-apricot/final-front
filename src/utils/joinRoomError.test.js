import { test } from 'node:test'
import assert from 'node:assert/strict'
import { classifyJoinRoomError } from './joinRoomError.js'

const responseError = (status, message) => ({ response: { status, data: { code: status, message, data: null } } })

test('참가 API의 진행 중·정원 초과 400 응답은 사유와 함께 참가 불가 화면으로 이동한다', () => {
  for (const reason of ['이미 시작된 방이라 입장할 수 없습니다.', '방 인원이 가득 찼습니다.']) {
    assert.deepEqual(classifyJoinRoomError(responseError(400, reason)), { path: '/error/join', reason })
  }
})

test('입력 검증 400 및 닉네임 중복 409는 폼에 남아 수정할 수 있다', () => {
  for (const message of ['닉네임은 20자까지 입력할 수 있습니다.', '출발 위치를 선택해주세요.']) {
    assert.deepEqual(classifyJoinRoomError(responseError(400, message)), { message })
  }
  const duplicate = classifyJoinRoomError(responseError(409, '이미 존재하는 값입니다.'))
  assert.equal(duplicate.path, undefined)
  assert.match(duplicate.message, /닉네임/)
})

test('없는 방, 권한 부족, 서버 오류, 연결 실패를 구분한다', () => {
  assert.equal(classifyJoinRoomError(responseError(404)).path, '/error/room')
  assert.equal(classifyJoinRoomError(responseError(403)).path, '/error/join')
  assert.equal(classifyJoinRoomError(responseError(500)).path, '/error')
  assert.equal(classifyJoinRoomError({}).path, '/error')
})
