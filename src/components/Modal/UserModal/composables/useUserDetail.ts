import apis from '/@/lib/apis'
import { wsListener } from '/@/lib/websocket'
import type {
  UserIconUpdatedEvent,
  UserTagsUpdatedEvent,
  UserUpdatedEvent
} from '/@/lib/websocket/events'
import type { UserId } from '/@/types/entity-ids'
import type { UserDetail } from '@traptitech/traq'
import { onMounted, ref } from 'vue'
import useMittListener from '/@/composables/utils/useMittListener'

const useUserDetail = (props: { id: UserId }) => {
  const userDetail = ref<UserDetail>()

  const fetch = async () => {
    const { data: res } = await apis.getUser(props.id)
    userDetail.value = res
  }
  onMounted(() => {
    fetch()
  })

  const onUserUpdated = ({
    id
  }: UserUpdatedEvent | UserTagsUpdatedEvent | UserIconUpdatedEvent) => {
    if (id !== props.id) return
    fetch()
  }

  useMittListener(wsListener, 'reconnect', fetch)
  useMittListener(wsListener, 'USER_UPDATED', onUserUpdated)
  useMittListener(wsListener, 'USER_TAGS_UPDATED', onUserUpdated)
  useMittListener(wsListener, 'USER_ICON_UPDATED', onUserUpdated)

  return { userDetail }
}

export default useUserDetail
