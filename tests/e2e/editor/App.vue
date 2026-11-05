<template>
  <main :style="theme">
    <section ref="inputFrame" data-testid="input-frame">
      <MessageInputEditor
        v-if="mode === 'message'"
        ref="messageInput"
        v-model="text"
        :document-key="documentRevision"
        :is-posting="readonly"
        simple-padding
        @post-message="posts++"
      />

      <ReferenceInput
        v-else
        v-model="text"
        :document-key="documentRevision"
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

    <button type="button" data-testid="outside">入力欄の外へ</button>
    <pre data-testid="source">{{ text }}</pre>
    <output data-testid="posts">{{ posts }}</output>
  </main>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'

import { until } from '@vueuse/core'

import MessageInputEditor from '/@/components/Main/MainView/MessageInput/MessageInputEditor.vue'
import MessageInputInsertStampButton from '/@/components/Main/MainView/MessageInput/MessageInputInsertStampButton.vue'
import useTextStampPickerInvoker from '/@/components/Main/MainView/composables/useTextStampPickerInvoker'
import StampPickerContainer from '/@/components/Main/StampPicker/StampPickerContainer.vue'
import ReferenceInput from '/@/components/UI/ReferenceInput.vue'
import useHtmlDataset from '/@/composables/document/useHtmlDataset'
import useRecentKeyboardInput from '/@/composables/dom/useRecentKeyboardInput'
import { resolveTheme } from '/@/lib/theme/resolve'
import { getThemeVariables } from '/@/lib/theme/variables'
import { useBrowserSettings } from '/@/store/app/browserSettings'
import { useFeatureFlagSettings } from '/@/store/app/featureFlagSettings'
import { useChannelsStore } from '/@/store/entities/channels'
import { useGroupsStore } from '/@/store/entities/groups'
import { useStampsStore } from '/@/store/entities/stamps'
import { useUsersStore } from '/@/store/entities/users'

import type { EditorDraft } from './harness'

const text = ref('')
const documentRevision = ref(0)
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

const ready = Promise.all([
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

  async load(draft) {
    await ready
    await flags.updateFeatureFlagStatus('inline_markdown', draft.markdown)
    mode.value = draft.mode ?? 'message'
    readonly.value = draft.readonly ?? false
    if (text.value !== draft.text) documentRevision.value++
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
