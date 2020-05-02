import { computed, Ref } from '@vue/composition-api'
import store from '@/store'
import { User } from '@traptitech/traq'
import { UserId } from '@/types/entity-ids'

export const useUserModalOpener = (
  props: { userId: UserId; preventModal?: boolean },
  user: Ref<User | undefined>
) => {
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
    store.dispatch.ui.modal.pushModal({
      type: 'user',
      id: props.userId
    })
  }

  return {
    isClickable,
    openModal
  }
}
