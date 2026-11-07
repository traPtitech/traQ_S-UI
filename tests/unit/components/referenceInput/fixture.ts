import { nextTick } from 'vue'

import { EditorContent } from '@tiptap/vue-3'
import { type VueWrapper, mount } from '@vue/test-utils'

import ReferenceInput from '/@/components/UI/ReferenceInput.vue'
import { encodeReference } from '/@/lib/references'
import { useBrowserSettings } from '/@/store/app/browserSettings'
import { useCommandPalette } from '/@/store/app/commandPalette'
import { useFeatureFlagSettings } from '/@/store/app/featureFlagSettings'
import { useChannelsStore } from '/@/store/entities/channels'
import { useGroupsStore } from '/@/store/entities/groups'
import { useStampsStore } from '/@/store/entities/stamps'
import { useUsersStore } from '/@/store/entities/users'

import {
  createChannel,
  createStamp,
  createUser
} from '../../../fixtures/entities'
import { resetReferenceEntities } from '../../fixtures/referenceEntities'

export const embedded = encodeReference({
  type: 'user',
  id: 'original-id',
  raw: '@alice'
})

const wrappers: ReturnType<typeof mount<typeof ReferenceInput>>[] = []

export const makeInput = async ({
  source = '',
  mode = 'message',
  suggestions = 'stub'
}: {
  source?: string
  mode?: 'message' | 'search'
  suggestions?: 'real' | 'stub'
} = {}) => {
  const wrapper = mount(ReferenceInput, {
    attachTo: document.body,
    props: {
      modelValue: source,
      mode,
      placeholder: 'message',
      'onUpdate:modelValue': (value: string) => {
        void wrapper.setProps({ modelValue: value })
      }
    },
    global: {
      stubs: {
        DropdownSuggester: suggestions === 'stub',
        DropdownSuggesterUserIcon: true,
        AStamp: true,
        teleport: true
      }
    }
  })

  wrappers.push(wrapper)
  await nextTick()

  return wrapper
}

export const getEditor = (wrapper: Pick<VueWrapper, 'getComponent'>) => {
  const editor = wrapper.getComponent(EditorContent).props('editor')
  if (!editor) throw new Error('ReferenceInput editor is not mounted')

  return editor
}

export const focus = async (wrapper: Awaited<ReturnType<typeof makeInput>>) => {
  wrapper.vm.element?.focus()
  await nextTick()
}

export const press = (
  wrapper: { vm: { element?: HTMLElement } },
  key: string,
  options: KeyboardEventInit = {}
) =>
  wrapper.vm.element?.dispatchEvent(
    new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
      ...options
    })
  )

export const lastValue = (wrapper: Awaited<ReturnType<typeof makeInput>>) =>
  wrapper.emitted('update:modelValue')?.at(-1)?.[0]

export const setChannelTree = () => {
  const { channelsMap } = useChannelsStore()

  for (const channel of [
    { id: 'times', name: 'times', parentId: null, children: ['year25'] },
    { id: 'year25', name: '25', parentId: 'times', children: ['person'] },
    { id: 'person', name: 'person', parentId: 'year25', children: [] }
  ])
    channelsMap.value.set(channel.id, createChannel(channel))
}

export const setBranchingChannelTree = () => {
  const { channelsMap } = useChannelsStore()

  for (const channel of [
    { id: 'team', name: 'team', parentId: null, children: ['sysad', 'sysdev'] },
    {
      id: 'sysad',
      name: 'SysAd',
      parentId: 'team',
      children: ['client', 'ops']
    },
    { id: 'sysdev', name: 'SysDev', parentId: 'team', children: [] },
    { id: 'client', name: 'Client', parentId: 'sysad', children: [] },
    { id: 'ops', name: 'Ops', parentId: 'sysad', children: [] },
    { id: 'test', name: 'test', parentId: null, children: [] }
  ])
    channelsMap.value.set(channel.id, createChannel(channel))
}

export const installReferenceInputFixture = () => {
  beforeAll(() => {
    Range.prototype.getClientRects = () => [] as unknown as DOMRectList
    Range.prototype.getBoundingClientRect = () => new DOMRect()
    HTMLElement.prototype.scrollIntoView = vi.fn()
  })

  afterEach(() => {
    wrappers.splice(0).forEach(wrapper => wrapper.unmount())
  })

  beforeEach(() => {
    resetReferenceEntities()

    const user = createUser({ id: 'original-id', iconFileId: '' })

    useUsersStore().usersMap.value.set(user.id, user)
    useGroupsStore().userGroupsMap.value.clear()
    useStampsStore().stampsMap.value.clear()

    for (const name of ['test', 'testing']) {
      const stamp = createStamp({
        id: name + '-stamp',
        name,
        fileId: '',
        isUnicode: false,
        creatorId: user.id,
        createdAt: user.updatedAt,
        updatedAt: user.updatedAt
      })

      useStampsStore().stampsMap.value.set(stamp.id, stamp)
    }

    useBrowserSettings().sendWithModifierKey.value = 'none'
    useFeatureFlagSettings().featureFlags.value.inline_markdown.enabled = true
    useCommandPalette().presentation.value = undefined
    useCommandPalette().currentInput.value = ''
  })
}
