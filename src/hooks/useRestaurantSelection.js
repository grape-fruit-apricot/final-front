import { useEffect, useState } from 'react'
import useFetchRestaurantList from './useFetchRestaurantList'
import useCreateRestaurant from './useCreateRestaurant'
import useFetchSelectionList from './useFetchSelectionList'
import useCreateSelection from './useCreateSelection'
import useUpdateReady from './useUpdateReady'

// 식당 목록과 선택·준비 상태를 소유하고 조회 및 소켓 결과를 같은 상태에 반영한다.
function useRestaurantSelection(roomUuid, myParticipantId, midpoint) {
  const [restaurants, setRestaurants] = useState([])
  const [selections, setSelections] = useState([])
  const [pendingRestaurantId, setPendingRestaurantId] = useState(null)
  const [isReselecting, setIsReselecting] = useState(false)
  const [addError, setAddError] = useState(null)
  const [selectError, setSelectError] = useState(null)
  const [readyError, setReadyError] = useState(null)

  const { fetch: fetchRestaurants } = useFetchRestaurantList();
  const { create: createRestaurant, isLoading: isAdding } =
    useCreateRestaurant();
  const { fetch: fetchSelections } = useFetchSelectionList();
  const { create: createSelection, isLoading: isSelecting } =
    useCreateSelection();
  const { update: updateReady, isLoading: isReadying } = useUpdateReady();

  // 중간지점이 생기면(새로고침 복원이든 소켓 브로드캐스트든) 그 주변 식당 목록을 불러온다.
  // midpoint 객체는 매번 새로 만들어지므로 존재 여부만 의존성으로 둔다.
  const hasMidpoint = midpoint != null;
  useEffect(() => {
    if (!hasMidpoint) return;

    let isCancelled = false;

    fetchRestaurants(roomUuid)
      .then((list) => {
        if (!isCancelled) setRestaurants(list);
      })
      .catch(() => {
        if (!isCancelled) setRestaurants([]);
      });

    fetchSelections(roomUuid)
      .then((list) => {
        if (!isCancelled) setSelections(list);
      })
      .catch(() => {
        if (!isCancelled) setSelections([]);
      });

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMidpoint, roomUuid]);

  // 추가에 성공하면 갱신된 목록이 소켓으로 돌아오므로 여기서 목록을 다시 조회하지 않는다.
  const handleAddRestaurant = async (payload) => {
    setAddError(null);
    await createRestaurant(roomUuid, {
      ...payload,
      participantId: Number(myParticipantId),
    }).catch((err) => {
      setAddError(
        err?.response?.data?.message ?? "식당을 추가하지 못했습니다.",
      );
    });
  };

  // 목록에서 누르는 것은 표시만 바꾼다. 서버로는 보내지 않는다.
  const handlePickRestaurant = (restaurantId) => {
    setSelectError(null);
    setPendingRestaurantId(restaurantId);
  };

  // 선택 결과도 소켓으로 갱신된 현황이 돌아오므로 여기서 다시 조회하지 않는다.
  const handleConfirmSelection = async () => {
    if (pendingRestaurantId == null) return;

    setSelectError(null);
    try {
      await createSelection(roomUuid, myParticipantId, pendingRestaurantId);
      // 고르고 나면 현황 화면으로 돌아간다. 실패하면 목록에 남아 다시 고를 수 있어야 한다.
      // pendingRestaurantId 는 비우지 않는다. 소켓으로 selections 가 도착하기 전에 비우면
      // 그 사이 목록에서 체크가 잠깐 풀렸다가 화면이 넘어간다.
      setIsReselecting(false);
    } catch (err) {
      setSelectError(
        err?.response?.data?.message ?? "식당을 선택하지 못했습니다.",
      );
    }
  };

  const handleReady = async () => {
    setReadyError(null);
    await updateReady(roomUuid, myParticipantId).catch((err) => {
      setReadyError(
        err?.response?.data?.message ?? "준비 상태를 바꾸지 못했습니다.",
      );
    });
  };

  // 내가 식당을 고르면 다른 참가자들의 선택을 지켜보는 화면으로 넘어간다.
  const mySelection = selections.find(
    (selection) => String(selection.participantId) === String(myParticipantId),
  );
  const handleReselectRestaurant = () => {
    setSelectError(null)
    // 저장된 선택을 표시한 채 식당을 다시 고른다.
    setPendingRestaurantId(mySelection?.restaurantId ?? null)
    setIsReselecting(true)
  }

  const handleCancelReselectRestaurant = () => {
    setSelectError(null)
    // 임시 선택을 버리고 서버에 저장된 선택으로 돌아간다.
    setPendingRestaurantId(mySelection?.restaurantId ?? null)
    setIsReselecting(false)
  }

  const hasSelected = Boolean(mySelection);
  // 중간지점 재설정 방송에서 선택 관련 상태만 초기화한다.
  const handleReset = () => {
    setSelections([])
    setPendingRestaurantId(null)
    setIsReselecting(false)
    setAddError(null)
    setSelectError(null)
    setReadyError(null)
  }

  return {
    state: {
      restaurants, selections, pendingRestaurantId, isReselecting, hasSelected,
      isAdding, isSelecting, isReadying, addError, selectError, readyError,
    },
    actions: {
      onAdd: handleAddRestaurant, onPick: handlePickRestaurant,
      onConfirm: handleConfirmSelection, onReady: handleReady,
      onReselect: handleReselectRestaurant, onCancelReselect: handleCancelReselectRestaurant,
    },
    events: { restaurants: setRestaurants, selections: setSelections, reset: handleReset },
  }
}

export default useRestaurantSelection
