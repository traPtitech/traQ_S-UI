import apis from '/@/lib/apis'
import { wsListener } from '/@/lib/websocket'
import {
  UserIconUpdatedEvent,
  UserTagsUpdatedEvent,
  UserUpdatedEvent
} from '/@/lib/websocket/events'
import { UserId } from '/@/types/entity-ids'
import { UserDetail } from '@traptitech/traq'
import { onBeforeUnmount, onMounted, ref } from 'vue'

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

  wsListener.on('reconnect', fetch)
  wsListener.on('USER_UPDATED', onUserUpdated)
  wsListener.on('USER_TAGS_UPDATED', onUserUpdated)
  wsListener.on('USER_ICON_UPDATED', onUserUpdated)

  onBeforeUnmount(() => {
    wsListener.off('reconnect', fetch)
    wsListener.off('USER_UPDATED', onUserUpdated)
    wsListener.off('USER_TAGS_UPDATED', onUserUpdated)
    wsListener.off('USER_ICON_UPDATED', onUserUpdated)
  })

  return { userDetail }
}

export default useUserDetail
