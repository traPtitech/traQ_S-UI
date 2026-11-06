<template>
  <main :style="theme">
    <section ref="inputFrame" data-testid="input-frame">
      <MessageInputEditor
        v-if="mode === 'message'"
        ref="messageInput"
        v-model="text"
        :document-key="documentKey"
        :is-posting="readonly || isPosting"
        simple-padding
        @post-message="submitDraft"
      />

      <ReferenceInput
        v-else
        v-model="text"
        :document-key="documentKey"
        mode="search"
        placeholder="検索"
        :readonly="readonly"
      />
    </section>

    <MessageInputInsertStampButton
      v-if="mode === 'message'"
      @click="toggleStampPicker"
    />
    <StampPickerContainer />

    <button type="button" data-testid="send" @click="submitDraft">送信</button>
    <button type="button" data-testid="outside">入力欄の外へ</button>
    <pre data-testid="source">{{ text }}</pre>
    <output data-testid="posts">{{ posts }}</output>
  </main>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, toRef } from 'vue'

import { until } from '@vueuse/core'

import MessageInputEditor from '/@/components/Main/MainView/MessageInput/MessageInputEditor.vue'
import MessageInputInsertStampButton from '/@/components/Main/MainView/MessageInput/MessageInputInsertStampButton.vue'
import usePostMessage from '/@/components/Main/MainView/MessageInput/composables/usePostMessage'
import useTextStampPickerInvoker from '/@/components/Main/MainView/composables/useTextStampPickerInvoker'
import StampPickerContainer from '/@/components/Main/StampPicker/StampPickerContainer.vue'
import ReferenceInput from '/@/components/UI/ReferenceInput.vue'
import useHtmlDataset from '/@/composables/document/useHtmlDataset'
import useRecentKeyboardInput from '/@/composables/dom/useRecentKeyboardInput'
import useMessageInputState from '/@/composables/messageInputState/useMessageInputState'
import { resolveTheme } from '/@/lib/theme/resolve'
import { getThemeVariables } from '/@/lib/theme/variables'
import { useBrowserSettings } from '/@/store/app/browserSettings'
import { useFeatureFlagSettings } from '/@/store/app/featureFlagSettings'
import { useChannelsStore } from '/@/store/entities/channels'
import { useGroupsStore } from '/@/store/entities/groups'
import { useStampsStore } from '/@/store/entities/stamps'
import { useUsersStore } from '/@/store/entities/users'
import { useMessageInputStateStore } from '/@/store/ui/messageInputStateStore'

import type { EditorDraft } from './harness'

const draftKey = ref('editor-0')
let nextDocument = 0
const { state, documentKey } = useMessageInputState(draftKey)
const text = toRef(state, 'text')
const mode = ref<EditorDraft['mode']>('message')
const readonly = ref(false)
const posts = ref(0)
const theme = getThemeVariables(resolveTheme(window.defaultLightTheme))
// Teleported suggestion and stamp picker menus also need the application theme.
for (const [property, value] of Object.entries(theme)) {
  document.documentElement.style.setProperty(property, value)
}
const flags = useFeatureFlagSettings()

useRecentKeyboardInput()
const { ecoMode } = useBrowserSettings()
useHtmlDataset('ecoMode', ecoMode)

const messageInput = ref<InstanceType<typeof MessageInputEditor>>()
const inputFrame = ref<HTMLElement>()
const { toggleStampPicker } = useTextStampPickerInvoker(
  text,
  computed(() => messageInput.value?.inputHandle),
  inputFrame
)

const channels = useChannelsStore()
channels.bothChannelsMapFetched.value = true
for (const channel of [
  {
    id: 'mobile-times',
    name: 'times',
    parentId: null,
    children: ['mobile-year25']
  },
  {
    id: 'mobile-year25',
    name: '25',
    parentId: 'mobile-times',
    children: ['mobile-person']
  },
  {
    id: 'mobile-person',
    name: 'person',
    parentId: 'mobile-year25',
    children: []
  }
]) {
  channels.channelsMap.value.set(channel.id, {
    ...channel,
    archived: false,
    force: false,
    topic: ''
  })
}
const { stampsMap, stampsMapFetched } = useStampsStore()
for (const name of [
  'ok_hand',
  ...Array.from(
    { length: 20 },
    (_, index) => `scroll_${index.toString().padStart(2, '0')}`
  )
]) {
  const id = name.replaceAll('_', '-')
  stampsMap.value.set(id, {
    id,
    name,
    creatorId: '11111111-1111-4111-8111-111111111111',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    fileId: 'icon',
    isUnicode: false
  })
}
stampsMapFetched.value = true

const users = useUsersStore()
const { postMessage, isPosting } = usePostMessage('mobile-person', draftKey)

// Exercise the production posting pipeline; the test intercepts the API request.
const submitDraft = async () => {
  if (await postMessage()) posts.value++
}

const ready = Promise.all([
  useMessageInputStateStore().restoringPromise,
  users.fetchUsers(),
  useGroupsStore().fetchUserGroups(),
  until(flags.restoring).toBe(false)
]).then(() => {
  users.usersMap.value.set('11111111-1111-4111-8111-111111111111', {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'alice',
    displayName: 'Alice',
    state: 1,
    bot: false,
    iconFileId: 'icon',
    updatedAt: '2026-01-01T00:00:00Z'
  })
})

window.editorHarness = {
  ready,

  async setEcoMode(enabled) {
    ecoMode.value = enabled
    await nextTick()
  },

  async updateOptions(options) {
    if (options.markdown !== undefined)
      await flags.updateFeatureFlagStatus('inline_markdown', options.markdown)
    if (options.readonly !== undefined) readonly.value = options.readonly
    await nextTick()
  },

  async load(draft) {
    await ready
    await flags.updateFeatureFlagStatus('inline_markdown', draft.markdown)
    mode.value = draft.mode ?? 'message'
    readonly.value = draft.readonly ?? false
    draftKey.value = draft.documentKey ?? `editor-${++nextDocument}`
    text.value = draft.text
    posts.value = 0
    await nextTick()
  }
}
</script>

<style lang="scss" scoped>
main {
  max-width: 800px;
  margin: 40px auto;
  padding: 24px;
  background: var(--theme-background-primary-default);
}

button,
pre {
  margin-top: 24px;
}
</style>
