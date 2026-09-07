import { useEffect, useState } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import BottomNav from './BottomNav'
import useMyParticipantId from '../../hooks/useMyParticipantId'
import useFetchParticipantList from '../../hooks/useFetchParticipantList'
import useFetchRoom from '../../hooks/useFetchRoom'
import useLeaveRoom from '../../hooks/useLeaveRoom'
import useRoomSocket from '../../hooks/useRoomSocket'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorMessage from '../common/ErrorMessage'

// 방 진행 화면들의 공통 레이아웃: 탭 콘텐츠(Outlet) + 하단 네브.
//
// 이 레이아웃은 탭을 옮겨도 리마운트되지 않는다. 그래서 두 가지를 여기서 들고 있는다.
// 1) 소켓 연결. 이게 없으면 탭을 옮길 때 연결이 끊기고 서버가 이탈로 보고 게임 차례를 넘겨버린다.
// 2) 참가자 목록. 딱! 과 멤버 두 탭이 같은 목록을 봐야 해서, 각자 조회하면 값이 어긋난다.
function RoomLayout() {
  const { roomUuid } = useParams()
  const navigate = useNavigate()
  const myParticipantId = useMyParticipantId(roomUuid)

  const { fetch: fetchParticipants } = useFetchParticipantList()
  const { fetch: fetchRoomInfo } = useFetchRoom()
  const { leave: leaveRoom, isLoading: isLeaving } = useLeaveRoom()

  // 방 정보는 변하지 않는 값(maxParticipants)에만 쓴다.
  // 이 레이아웃은 리마운트되지 않아 stage 나 중간지점 좌표는 입장 시점에서 멈춰 있으므로,
  // 진행 상태로 화면을 복원하는 일은 각 화면이 자기 조회로 한다.
  const [room, setRoom] = useState(null)
  const [participants, setParticipants] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    // 방을 옮기면 이전 방의 응답이 늦게 도착해 새 방의 상태를 덮어쓸 수 있다.
    let isCancelled = false

    setIsLoading(true)
    setLoadError(null)
    Promise.all([fetchParticipants(roomUuid), fetchRoomInfo(roomUuid)])
      .then(([participantList, roomInfo]) => {
        if (isCancelled) return

        setParticipants(participantList)
        setRoom(roomInfo)
      })
      .catch((err) => {
        if (!isCancelled) setLoadError(err)
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false)
      })

    return () => {
      isCancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomUuid])

  // 구독할 토픽 목록은 연결에 붙는 시점에 한 번만 읽으므로 렌더마다 같아야 한다(useRoomSocket 참고).
  // 아래는 조건 없는 고정 두 키다. 여기에 조건부 키를 넣으면 안 된다.
  const { publish } = useRoomSocket(roomUuid, myParticipantId, {
    // 입장 토픽은 새로 들어온 1명만 보낸다. 최초 조회와 겹쳐 도착할 수 있어 확인하고 붙인다.
    participants: (newParticipant) => {
      setParticipants((prev) =>
        prev.some((participant) => participant.participantId === newParticipant.participantId)
          ? prev
          : [...prev, newParticipant]
      )
    },
    // 준비 상태 변경과 퇴장 모두 갱신된 목록 전체가 이 토픽으로 온다.
    'participants/ready': (list) => {
      setParticipants(list)
    },
  })

  const handleLeaveRoom = async () => {
    try {
      await leaveRoom(roomUuid, myParticipantId)
    } catch (err) {
      // 게임 중에는 참가자 행을 지울 수 없어 서버가 400 으로 거절한다. 그때만 소켓으로 이탈을 알린다.
      // 거절됐다는 건 게임이 돌고 있다는 뜻이라 안전하다. 게임이 없는데 보내면 서버가 방 전체에 오류를 방송한다.
      if (err?.response?.status === 400) {
        publish('/app/game/leave')
      }
    }

    // 서버 정리에 실패해도 화면에 붙잡아두지 않는다. 나가기를 확인한 사람을 방에 가둘 수는 없다.
    localStorage.removeItem(`room:${roomUuid}:participantId`)
    navigate('/')
  }

  // 로딩·에러일 때도 하단 네브는 남긴다. 방 정보를 못 불러온 방에서 나갈 수 없으면 갇힌다.
  return (
    <>
      <div className="pb-20">
        {isLoading ? (
          <LoadingSpinner />
        ) : loadError ? (
          <ErrorMessage message="방 정보를 불러오지 못했습니다." />
        ) : (
          <Outlet context={{ roomUuid, myParticipantId, room, participants }} />
        )}
      </div>
      <BottomNav onLeave={handleLeaveRoom} isLeaving={isLeaving} />
    </>
  )
}

export default RoomLayout
