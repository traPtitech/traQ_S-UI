import { computed, onMounted } from 'vue'

import useMittListener from '/@/composables/utils/useMittListener'
import { wsListener } from '/@/lib/websocket'
import { useUsersStore } from '/@/store/entities/users'
import type { UserId } from '/@/types/entity-ids'

const useUserDetail = (props: { id: UserId }) => {
  const { userDetailsMap, fetchUserDetail } = useUsersStore()

  // 取得済みの詳細があればそれをすぐに表示し、開くたびに裏で取り直して最新にする
  // USER_UPDATED などによる更新は users store 側で反映される
  const userDetail = computed(() => userDetailsMap.value.get(props.id))

  const fetch = async () => {
    await fetchUserDetail({ userId: props.id, cacheStrategy: 'forceFetch' })
  }
  onMounted(() => {
    fetch()
  })

  useMittListener(wsListener, 'reconnect', fetch)

  return { userDetail }
}

export default useUserDetail
