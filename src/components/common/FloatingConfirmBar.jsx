import Button from './Button'

// 목록에서 무언가를 고르면 아래에서 올라오는 확정 버튼.
//
// 누르는 것과 확정하는 것을 나눠야 잘못 눌렀을 때 되돌릴 수 있다. 그런데 확정 버튼을
// 목록 끝에 두면 목록이 길 때 화면 밖으로 밀려나서, 고른 다음 스크롤을 내려야 한다.
// 그래서 떠 있는 하단 네브 바로 위에 붙여두고 보이기만 바꾼다.
//
// 붙였다 떼지 않고 항상 두는 이유: 조건부로 마운트하면 올라오는 동작을 줄 수 없다.
// 안 보일 때는 disabled 라 Button 이 pointer-events 를 끄므로 투명한 채로 눌리지 않는다.
function FloatingConfirmBar({ isVisible, onConfirm, disabled = false, children }) {
  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+6.25rem)] z-40 px-3.5 transition-[opacity,transform] duration-200 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
      }`}
      aria-hidden={!isVisible}
    >
      <div className="mx-auto max-w-[430px]">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          className="pointer-events-auto shadow-nav"
          onClick={onConfirm}
          disabled={!isVisible || disabled}
        >
          {children}
        </Button>
      </div>
    </div>
  )
}

export default FloatingConfirmBar
