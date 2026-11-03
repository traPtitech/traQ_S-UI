import type { Channel } from '@traptitech/traq'

import { routerKey } from 'vue-router'

import { createTestingPinia } from '@pinia/testing'
import { flushPromises, mount } from '@vue/test-utils'
import { AxiosHeaders } from 'axios'

import DraftListDetailsPanelChannel from '/@/components/Main/NavigationBar/EphemeralNavigationContent/DraftList/DraftListDetailsPanelChannel.vue'
import apis from '/@/lib/apis'
import { useChannelsStore } from '/@/store/entities/channels'

vi.mock('/@/lib/markdown/markdown', () => ({
  renderInline: async (text: string) => ({ renderedText: text })
}))

test('renders a thread draft using its fetched name and UUID link', async () => {
  const pinia = createTestingPinia({ stubActions: false })
  const { channelsMap, bothChannelsMapFetched } = useChannelsStore(pinia)
  const parent: Channel = {
    id: '10000000-0000-4000-8000-000000000001',
    name: 'general',
    parentId: null,
    parentMessageId: null,
    archived: false,
    force: false,
    topic: '',
    children: []
  }
  const threadId = '10000000-0000-4000-8000-000000000002'
  channelsMap.value = new Map([[parent.id, parent]])
  bothChannelsMapFetched.value = true
  const data = {
    ...parent,
    id: threadId,
    parentId: parent.id,
    parentMessageId: 'message-id',
    name: 'discussion'
  }
  const getChannel = vi.spyOn(apis, 'getChannel').mockResolvedValue({
    data,
    status: 200,
    statusText: 'OK',
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() }
  })
  try {
    const wrapper = mount(DraftListDetailsPanelChannel, {
      props: {
        channelId: threadId,
        state: { text: 'draft text', attachments: [] }
      },
      global: {
        plugins: [pinia],
        provide: { [routerKey as symbol]: {} },
        stubs: {
          RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' },
          AIcon: true
        }
      }
    })
    await flushPromises()
    expect(wrapper.text()).toContain('draft text')
    expect(wrapper.text()).toContain('#general/discussion')
    expect(getChannel).toHaveBeenCalledTimes(1)
    expect(wrapper.get('a').attributes('href')).toBe(
      `/channels/general/${threadId}`
    )
    expect(channelsMap.value.has(threadId)).toBe(false)

    await wrapper.setProps({ state: { text: '', attachments: [] } })
    await flushPromises()
    expect(wrapper.text()).not.toContain('draft text')
    wrapper.unmount()
  } finally {
    getChannel.mockRestore()
  }
})
