// 방에 입장할 때 저장해 둔 내 참가자 ID를 읽는다.
// 방 안의 화면들이 모두 같은 키를 쓰므로 키 형태를 한 곳에서만 정한다.
// 입장하지 않은 방을 직접 열면 null 이므로, 쓰는 쪽에서 없는 경우를 처리해야 한다.
function useMyParticipantId(roomUuid) {
  return localStorage.getItem(`room:${roomUuid}:participantId`)
}

export default useMyParticipantId
