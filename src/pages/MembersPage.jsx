import { useEffect, useRef, useState } from 'react'
import { useOutletContext, useParams } from 'react-router-dom'
import useFetchRestaurantList from '../hooks/useFetchRestaurantList'
import useFetchSelectionList from '../hooks/useFetchSelectionList'
import useRoomSocket from '../hooks/useRoomSocket'
import { copyToClipboard } from '../utils/clipboard'
import { distanceInMeters, formatDistance } from '../utils/geo'
import { formatRelativeTime } from '../utils/time'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import ParticipantList from '../components/common/ParticipantList'
import PageHeader from '../components/layout/PageHeader'
import PageSheet from '../components/layout/PageSheet'

// 방에 있는 멤버를 언제든 확인하는 화면.
// 참가자 목록은 RoomLayout 이 소켓으로 최신 상태를 유지하므로 여기서는 조회하지 않는다.
// 준비 상태는 보여주지 않는다. 준비/대기는 게임 준비 단계 화면에서만 의미가 있다.
function MembersPage() {
  const { roomUuid } = useParams()
  const { myParticipantId, room, participants } = useOutletContext()

  const remaining = room.maxParticipants - participants.length
  const inviteLink = `${window.location.origin}/join/${roomUuid}`

  // 이름만 늘어놓으면 목록이 짧을 때 화면이 휑하고, 무엇보다 "얘가 뭘 골랐지"를
  // 딱! 탭으로 건너가야만 알 수 있다. 선택 현황은 이 화면에서도 필요한 정보다.
  const { fetch: fetchSelections } = useFetchSelectionList()
  const { fetch: fetchRestaurants } = useFetchRestaurantList()
  const [selections, setSelections] = useState([])
  const [restaurants, setRestaurants] = useState([])

  useEffect(() => {
    // 방을 옮기면 이전 방의 응답이 늦게 도착해 새 방의 값을 덮어쓸 수 있다.
    let isCancelled = false

    Promise.all([fetchSelections(roomUuid), fetchRestaurants(roomUuid)])
      .then(([selectionList, restaurantList]) => {
        if (isCancelled) return
        setSelections(selectionList)
        setRestaurants(restaurantList)
      })
      // 아직 식당 단계가 아닌 방에서는 비어 있는 것이 정상이라 실패해도 조용히 넘어간다.
      // 이 화면의 본 내용(멤버 목록)은 이 값 없이도 그려진다.
      .catch(() => {})

    return () => {
      isCancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomUuid])

  // 다른 사람이 고르는 것을 이 화면에서도 그대로 본다.
  // 구독 키는 연결 시점에 한 번만 읽히므로 조건 없는 고정 한 개여야 한다(useRoomSocket 참고).
  useRoomSocket(roomUuid, myParticipantId, {
    selections: (list) => setSelections(list),
  })

  const midpoint =
    room.midpointLat != null && room.midpointLng != null
      ? { lat: room.midpointLat, lng: room.midpointLng }
      : null

  // 닉네임 아래 한 줄. 고른 식당이 있으면 그것을 먼저 보여주고,
  // 아직 고르기 전이라면 어디서 오는지(거리)를, 그것도 없으면 입장 시각을 쓴다.
  const getDetail = (participant) => {
    const selection = selections.find(
      (item) => String(item.participantId) === String(participant.participantId)
    )
    const restaurant = selection
      ? restaurants.find((item) => item.restaurantId === selection.restaurantId)
      : null

    const distance = midpoint
      ? formatDistance(
          distanceInMeters({ lat: participant.prefLat, lng: participant.prefLng }, midpoint)
        )
      : null

    const parts = [restaurant?.name, distance && `중간지점에서 ${distance}`].filter(Boolean)

    // 고른 것도 거리도 없는 초기 단계에서만 입장 시각으로 자리를 채운다.
    if (parts.length === 0) {
      return formatRelativeTime(participant.joinedAt)
    }
    return parts.join(' · ')
  }

  const [isCopied, setIsCopied] = useState(false)
  const copiedTimerRef = useRef(null)

  // 연달아 복사하면 먼저 걸어둔 타이머가 "복사됨!"을 예정보다 일찍 지운다.
  useEffect(() => {
    return () => clearTimeout(copiedTimerRef.current)
  }, [])

  const handleCopyLink = async () => {
    try {
      await copyToClipboard(inviteLink)
      setIsCopied(true)
      clearTimeout(copiedTimerRef.current)
      copiedTimerRef.current = setTimeout(() => setIsCopied(false), 2000)
    } catch {
      setIsCopied(false)
    }
  }

  return (
    // 탭 화면이라 되돌아갈 곳이 없다(showBack={false}).
    // pb 는 떠 있는 하단 네브 자리다. 시트 배경 안쪽에 둬야 색이 끊기지 않는다.
    <div className="flex min-h-screen flex-col bg-header">
      <PageHeader
        title="멤버"
        showBack={false}
        right={`${participants.length}/${room.maxParticipants}`}
      />
      <PageSheet className="pb-[calc(env(safe-area-inset-bottom)+7rem)]">
        <ParticipantList
          participants={participants}
          myParticipantId={myParticipantId}
          getDetail={getDetail}
        />

        {/* 멤버를 보다가 "더 부를까?" 하는 자리라 초대를 여기 둔다.
            목록만 있으면 화면 아래가 통째로 비기도 한다. */}
        <Card className="mt-auto p-4 text-center">
          {remaining > 0 ? (
            <>
              <p className="text-[15px] font-bold text-app-text">아직 {remaining}자리 남았어요</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                링크를 보내서 친구를 초대해보세요.
              </p>
              <Button variant="secondary" fullWidth className="mt-3" onClick={handleCopyLink}>
                {isCopied ? '링크 복사됨!' : '초대 링크 복사하기'}
              </Button>
            </>
          ) : (
            <p className="text-[15px] font-bold text-ink-soft">정원이 다 찼어요</p>
          )}
        </Card>
      </PageSheet>
    </div>
  )
}

export default MembersPage
