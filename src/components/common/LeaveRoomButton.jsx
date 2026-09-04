// 방에서 나가는 버튼. 되돌릴 수 없으므로 한 번 확인한다.
// 실제로 무엇을 할지는 게임 진행 여부에 따라 달라지므로 페이지가 정한다.
function LeaveRoomButton({ onLeave, isLeaving }) {
  const handleClick = () => {
    if (window.confirm('방에서 나가시겠습니까?')) {
      onLeave()
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLeaving}
      className="min-h-11 shrink-0 rounded-lg px-3 text-sm font-semibold text-white/70 disabled:opacity-60"
    >
      나가기
    </button>
  )
}

export default LeaveRoomButton
