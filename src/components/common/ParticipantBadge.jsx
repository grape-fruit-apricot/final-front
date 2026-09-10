// 참가자 이름 옆에 붙는 배지(나 / 방장).
// 두 목록(멤버 탭의 ParticipantItem, 딱! 탭의 ParticipantSelectionList)이 같은 모양을 써야
// 탭을 옮겨도 같은 표시로 읽힌다. 그래서 색과 크기를 여기 한 곳에서만 정한다.
//
//   me   내가 누구인지. 이게 없으면 기기가 다른 사람 신원으로 붙어 있어도 알아챌 수 없다.
//   host 방장이 누구인지. 시작 버튼은 방장에게만 보이므로, 안 보이는 이유를 여기서 알 수 있다.
const TONES = {
  me: 'bg-accent-tint text-accent-ink',
  host: 'bg-fill text-ink-soft',
}

function ParticipantBadge({ tone, children }) {
  return (
    <span
      className={`flex-none rounded-full px-2 py-0.5 text-xs font-bold ${TONES[tone]}`}
    >
      {children}
    </span>
  )
}

export default ParticipantBadge
