import BackButton from '../common/BackButton'

// 진입 흐름 화면의 상단 바. 아래 오는 PageSheet 와 짝을 이뤄 "머리말 + 본문" 구조를 만든다.
// 시트가 위로 둥글게 올라오면서 헤더와 본문 사이에 경계가 생긴다.
//
// 색이 있는 띠가 되면서 노치·상태바 아래로 내용이 파고들 수 있어 safe-area 만큼 더 내린다.
//
// showBack: 되돌아갈 곳이 없으면 끈다(자리는 남겨 제목이 가운데 오게 한다).
// right: 오른쪽에 곁들일 짧은 텍스트(인원수 등).
function PageHeader({ title, showBack = true, right = null }) {
  return (
    <header className="flex shrink-0 items-center gap-1 px-2 pb-4 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
      {showBack ? <BackButton /> : <span className="size-11 shrink-0" aria-hidden="true" />}
      <h1 className="flex-1 text-center text-[17px] font-extrabold tracking-tight text-app-text">
        {title}
      </h1>
      <span className="flex size-11 shrink-0 items-center justify-center text-sm text-app-text/70">
        {right}
      </span>
    </header>
  )
}

export default PageHeader
