import { createMemoryHistory, createRouter } from 'vue-router'

import { createTestingPinia } from '@pinia/testing'
import { mount } from '@vue/test-utils'

import boolAttr from '/@/bool-attr'
import ShareTargetMessageInput from '/@/components/ShareTarget/ShareTargetMessageInput.vue'

it('focuses the shared message input from its visible label', async () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { render: () => null } }]
  })
  const wrapper = mount(ShareTargetMessageInput, {
    attachTo: document.body,
    global: {
      plugins: [createTestingPinia(), boolAttr, router],
      stubs: {
        DropdownSuggester: true,
        MessageInputFileList: true,
        MessageInputInsertStampButton: true,
        MessageInputUploadButton: true
      }
    }
  })

  try {
    await vi.waitFor(() =>
      expect(wrapper.find('[role="textbox"]').exists()).toBe(true)
    )
    const input = wrapper.get<HTMLElement>('[role="textbox"]')
    input.element.blur()
    expect(document.activeElement).not.toBe(input.element)

    const label = wrapper.get(`[id="${input.attributes('aria-labelledby')}"]`)
    expect(label.text()).toBe('メッセージ')
    await label.trigger('click')
    await vi.waitFor(() => expect(document.activeElement).toBe(input.element))
  } finally {
    wrapper.unmount()
  }
})
