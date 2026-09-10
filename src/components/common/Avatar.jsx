// 닉네임 첫 글자를 딴 동그라미. 목록이 글자만 있으면 밋밋하고 눈이 줄을 못 따라간다.
// 참가자가 나오는 곳마다 같은 모양이어야 "같은 사람"으로 읽히므로 한 곳에서만 만든다.
//
// 채워진 주황은 앱 전체에서 "나" 한 가지 뜻으로만 쓴다(경로 화면의 내 소요시간과 같은 규칙).
// 방장은 색이 아니라 배지로 구분한다.
function Avatar({ nickname, size = 'md', isMe = false }) {
  // md 는 리스트 구분선 들여쓰기(16 + 40 + 12 = 68px)에 맞춘 40px 이다.
  const box = size === 'sm' ? 'size-8 text-xs' : 'size-10 text-base'
  const tone = isMe ? 'bg-point-orange text-white' : 'bg-fill text-app-text'

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-extrabold ${box} ${tone}`}
      aria-hidden="true"
    >
      {nickname?.trim().charAt(0) || '?'}
    </span>
  )
}

export default Avatar
