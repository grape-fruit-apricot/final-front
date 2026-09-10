// 면 하나. 예전에는 흰 배경 + rounded-lg 조합이 화면마다 조금씩 다르게 복제돼 있었다.
//
//   surface  지도가 없는 화면의 흰 표면
//   glass    지도 위에 뜨는 유리. 지도가 아래로 비쳐 보인다
//   tint     선택된 항목처럼 강조가 필요한 면
//   quiet    테두리만 있는 조용한 면(입력 그룹 등)
const TONES = {
  surface: 'bg-surface border border-edge shadow-surface',
  glass: 'bg-glass backdrop-blur-2xl backdrop-saturate-150 border border-white/70 shadow-raised',
  tint: 'bg-accent-tint border border-point-orange/40',
  quiet: 'bg-surface border border-edge',
}

// as: 같은 면이라도 자리에 따라 section/li 여야 의미가 맞는 곳이 있다.
function Card({ as: Tag = 'div', tone = 'surface', className = '', children, ...rest }) {
  return (
    <Tag className={`rounded-card ${TONES[tone]} ${className}`} {...rest}>
      {children}
    </Tag>
  )
}

export default Card
