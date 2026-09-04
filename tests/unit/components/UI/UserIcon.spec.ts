import { createTestingPinia } from '@pinia/testing'
import type { User } from '@traptitech/traq'
import { UserAccountState } from '@traptitech/traq'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'

import UserIcon from '/@/components/UI/UserIcon.vue'
import { useModalStore } from '/@/store/ui/modal'
import { useUsersStore } from '/@/store/entities/users'

const user: User = {
  id: 'user',
  name: 'user',
  displayName: 'User',
  iconFileId: '',
  state: UserAccountState.active,
  bot: false,
  updatedAt: '2020-03-18T04:17:10.177846Z'
}

const mountIcon = (preventModal: boolean) => {
  const pinia = createTestingPinia()
  const { usersMap } = useUsersStore()
  usersMap.value.set(user.id, user)

  const onParentClick = vi.fn()
  const wrapper = mount(
    defineComponent({
      components: { UserIcon },
      setup: () => ({ onParentClick, preventModal, userId: user.id }),
      template: `
        <div data-testid="parent" @click="onParentClick">
          <UserIcon :user-id="userId" :prevent-modal="preventModal" />
        </div>
      `
    }),
    { global: { plugins: [pinia] } }
  )

  const { pushModal } = useModalStore()
  return { onParentClick, pushModal, wrapper }
}

describe('UserIcon', () => {
  it('lets the parent handle clicks when the modal is prevented', async () => {
    const { onParentClick, pushModal, wrapper } = mountIcon(true)

    await wrapper.get('[role="img"]').trigger('click')

    expect(onParentClick).toHaveBeenCalledOnce()
    expect(pushModal).not.toHaveBeenCalled()
  })

  it('opens the user modal without invoking the parent when clickable', async () => {
    const { onParentClick, pushModal, wrapper } = mountIcon(false)

    await wrapper.get('[role="button"]').trigger('click')

    expect(onParentClick).not.toHaveBeenCalled()
    expect(pushModal).toHaveBeenCalledWith({ type: 'user', id: user.id })
  })
})
