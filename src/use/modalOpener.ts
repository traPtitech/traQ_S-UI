import { computed, Ref } from 'vue'
import store from '/@/vuex'
import { User } from '@traptitech/traq'
import { UserId } from '/@/types/entity-ids'
import { useModalStore } from '/@/store/ui/modal'

export const useUserModalOpener = (
  props: { userId?: UserId; preventModal?: boolean },
  user: Ref<User | undefined>
) => {
  const { pushModal } = useModalStore()

  const isClickable = computed(
    () =>
      user.value &&
      !props.preventModal &&
      !(user.value.bot && user.value.name.startsWith('Webhook#')) // Webhookはbotかつ`Webhook#`で始まるidのユーザー
  )
  const openModal = () => {
    if (!isClickable.value) {
      return
    }
    if (!props.userId) {
      return
    }
    pushModal({
      type: 'user',
      id: props.userId
    })
  }

  return {
    isClickable,
    openModal
  }
}
