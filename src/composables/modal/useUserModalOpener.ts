import type { Ref } from 'vue'
import { computed, unref } from 'vue'
import type { UserId } from '/@/types/entity-ids'
import { useModalStore } from '/@/store/ui/modal'
import { useUsersStore } from '/@/store/entities/users'

export const useUserModalOpener = (
  userId: Ref<UserId | undefined>,
  preventModal: Ref<boolean> | boolean = false
) => {
  const { usersMap } = useUsersStore()
  const { pushModal } = useModalStore()

  const user = computed(() => usersMap.value.get(userId.value ?? ''))

  const isClickable = computed(
    () =>
      user.value &&
      !unref(preventModal) &&
      !(user.value.bot && user.value.name.startsWith('Webhook#')) // Webhookはbotかつ`Webhook#`で始まるidのユーザー
  )

  const openModal = () => {
    if (!isClickable.value) {
      return
    }
    if (!userId.value) {
      return
    }
    pushModal({
      type: 'user',
      id: userId.value
    })
  }

  return {
    isClickable,
    openModal
  }
}
