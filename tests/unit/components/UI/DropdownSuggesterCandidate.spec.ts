import { UserAccountState } from '@traptitech/traq'

import { defineComponent } from 'vue'

import { createTestingPinia } from '@pinia/testing'
import { mount } from '@vue/test-utils'

import boolAttr from '/@/bool-attr'
import DropdownSuggesterCandidate from '/@/components/UI/DropdownSuggester/DropdownSuggesterCandidate.vue'
import UserIcon from '/@/components/UI/UserIcon.vue'
import { useUsersStore } from '/@/store/entities/users'
import { useModalStore } from '/@/store/ui/modal'

vi.mock('/@/store/ui/modal', () => ({
  useModalStore: () => ({ pushModal })
}))

const pushModal = vi.fn()

describe('DropdownSuggesterCandidate', () => {
  it('selects a suggestion when its user icon is clicked without opening a modal', async () => {
    const pinia = createTestingPinia()
    const id = 'user'

    useUsersStore().usersMap.value.set(id, {
      id,
      name: 'user',
      displayName: 'User',
      iconFileId: '',
      state: UserAccountState.active,
      bot: false,
      updatedAt: '2020-03-18T04:17:10.177846Z'
    })

    const select = vi.fn()

    const wrapper = mount(
      defineComponent({
        components: { DropdownSuggesterCandidate },
        setup: () => ({
          candidate: { type: 'user', id, text: '@user' },
          select
        }),
        template:
          '<DropdownSuggesterCandidate :candidate="candidate" @click="select" />'
      }),
      { global: { plugins: [pinia, boolAttr] } }
    )

    await wrapper.getComponent(UserIcon).trigger('click')

    expect(select).toHaveBeenCalledOnce()
    expect(useModalStore().pushModal).not.toHaveBeenCalled()
  })
})
