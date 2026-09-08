import { Children } from 'react'

// iOS 설정 앱식 묶음 리스트. 행마다 흰 카드를 띄우는 대신
// 컨테이너 하나에 담고 사이에만 얇은 구분선을 넣는다.
// 지금 멤버·참가자·소요시간 목록 네 곳이 같은 "이름 왼쪽 / 값 오른쪽" 행을 각자 복제하고 있다.
//
// dividerInset: 구분선이 시작하는 왼쪽 여백(px). 아바타가 있는 목록은 아바타 폭만큼 밀어준다.
function ListGroup({ title, footer, dividerInset = 0, className = '', children }) {
  // null 이나 false 로 걸러진 행은 빼야 구분선이 빈 자리에 남지 않는다.
  const rows = Children.toArray(children)

  return (
    <section className={className}>
      {title && (
        <h2 className="mb-2 px-4 text-xs font-bold tracking-wide text-ink-soft">{title}</h2>
      )}

      <div className="overflow-hidden rounded-card border border-edge bg-surface shadow-surface">
        {rows.map((row, index) => (
          <div key={row.key ?? index}>
            {index > 0 && (
              <div
                className="h-px bg-hairline"
                style={dividerInset ? { marginLeft: `${dividerInset}px` } : undefined}
              />
            )}
            {row}
          </div>
        ))}
      </div>

      {footer && <p className="mt-2 px-4 text-xs text-ink-soft">{footer}</p>}
    </section>
  )
}

export default ListGroup
