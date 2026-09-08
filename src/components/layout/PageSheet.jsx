// 헤더 아래에서 남은 높이를 끝까지 채우는 본문 시트.
// 위쪽만 둥글게 깎아 헤더와 본문의 경계를 만든다. flex-1 이라 내용이 적어도 화면이 비어 보이지 않고,
// 안에서 flex-1 을 쓰는 자식(지도 등)이 남은 공간을 그대로 받아갈 수 있다.
//
// 시트는 흰색이 아니라 바탕색(아이보리)이다. 안에 들어가는 카드·입력·말풍선이 전부 흰색이라
// 시트까지 희면 서로 구분되지 않는다. 헤더 쪽이 흰 면이고 시트가 그 위로 올라오는 구조다.
//
// 헤더와 시트의 명도차가 거의 없어서 색만으로는 경계가 생기지 않는다.
// 위쪽 헤어라인과 위로 향하는 그림자가 경계를 대신 만든다.
//
// 아래 여백은 기본값을 두지 않는다. 진입 흐름은 pb-6, 탭 화면은 떠 있는 네브 때문에 pb-28 이라
// 값이 갈리는데, 기본을 두고 className 으로 덮으면 같은 유틸리티끼리 부딪혀 CSS 순서에 좌우된다.
function PageSheet({ className = '', children }) {
  return (
    <div
      className={`flex min-h-0 flex-1 flex-col gap-4 rounded-t-[28px] border-t border-app-text/12 bg-background px-5 pt-5 shadow-glass ${className}`}
    >
      {children}
    </div>
  )
}

export default PageSheet
