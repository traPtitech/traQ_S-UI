<template>
  <div v-if="thread" :class="$style.content">
    <SidebarContentContainer>
      <ThreadNameEditor
        v-model="draftName"
        :current-name="thread.name"
        :is-editing="isEditing"
        :is-saving="pendingAction !== null"
        :error-message="nameError"
        :can-edit="canEdit"
        @edit="startEditing"
        @cancel="cancelEditing"
        @save="saveName"
      />
    </SidebarContentContainer>
    <ChannelInformationSidebarViewers
      v-model="isViewersDetailOpen"
      :viewer-ids="viewerIds"
      :inactive-viewer-ids="inactiveViewerIds"
    />
    <ThreadSidebarParentMessage :message-id="thread.parentMessageId" />
    <ChannelInformationSidebarPinned
      :pinned-message-length="pinnedMessagesCount"
      role="button"
      tabindex="0"
      @click-link="emit('moveToPinned')"
      @keydown.enter.prevent="emit('moveToPinned')"
      @keydown.space.prevent="emit('moveToPinned')"
    />
    <ChannelInformationSidebarEvents
      role="button"
      tabindex="0"
      @click-link="emit('moveToEvents')"
      @keydown.enter.prevent="emit('moveToEvents')"
      @keydown.space.prevent="emit('moveToEvents')"
    />
    <ThreadSidebarUsers title="メンバー" :user-ids="memberIds" />
    <ThreadSidebarUsers
      v-if="botIds?.length"
      title="参加BOT"
      :user-ids="botIds"
    />
    <div v-if="canEdit" :class="$style.archive">
      <FormButton
        type="secondary"
        :label="thread.archived ? 'アーカイブ解除' : 'アーカイブ'"
        :loading="pendingAction === 'archive'"
        :disabled="pendingAction !== null || isEditing"
        :class="$style.archiveButton"
        @click.prevent="toggleArchive"
      />
      <p v-if="archiveError" role="alert" :class="$style.error">
        {{ archiveError }}
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { PatchThreadRequest, UserPermission } from '@traptitech/traq'

import { computed, ref } from 'vue'

import { isAxiosError } from 'axios'

import ChannelInformationSidebarEvents from '/@/components/Main/MainView/ChannelView/ChannelSidebar/ChannelInformationSidebar/ChannelInformationSidebarEvents.vue'
import ChannelInformationSidebarPinned from '/@/components/Main/MainView/ChannelView/ChannelSidebar/ChannelInformationSidebar/ChannelInformationSidebarPinned.vue'
import ChannelInformationSidebarViewers from '/@/components/Main/MainView/ChannelView/ChannelSidebar/ChannelInformationSidebar/ChannelInformationSidebarViewers.vue'
import useChannelBots from '/@/components/Main/MainView/ChannelView/ChannelSidebar/ChannelInformationSidebar/composables/useChannelBots'
import SidebarContentContainer from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarContentContainer.vue'
import FormButton from '/@/components/UI/FormButton.vue'
import useChannelSubscribers from '/@/composables/subscription/useChannelSubscribers'
import apis from '/@/lib/apis'
import { useMeStore } from '/@/store/domain/me'
import { useThreadsStore } from '/@/store/entities/threads'
import { useUsersStore } from '/@/store/entities/users'
import type { ChannelId, UserId } from '/@/types/entity-ids'

import ThreadNameEditor from '../ThreadNameEditor.vue'
import ThreadSidebarParentMessage from './ThreadSidebarParentMessage.vue'
import ThreadSidebarUsers from './ThreadSidebarUsers.vue'

const props = withDefaults(
  defineProps<{
    channelId: ChannelId
    viewerIds: readonly UserId[]
    inactiveViewerIds: readonly UserId[]
    pinnedMessagesCount?: number
  }>(),
  { pinnedMessagesCount: 0 }
)
const isViewersDetailOpen = defineModel<boolean>('isViewersDetailOpen', {
  required: true
})
const emit = defineEmits<{ moveToPinned: []; moveToEvents: [] }>()
const { threadsMap } = useThreadsStore()
const { activeUsersMap } = useUsersStore()
const { detail } = useMeStore()
const thread = computed(() => threadsMap.value.get(props.channelId))
// shortcut: SDKの権限列挙に未収録。EditThreadの追加後に列挙値へ置き換える。
const canEdit = computed(
  () =>
    detail.value?.permissions.includes('edit_thread' as UserPermission) ?? false
)
const subscribers = useChannelSubscribers(props)
const memberIds = computed(() =>
  [...subscribers.value].filter(id => activeUsersMap.value.has(id))
)
const botIds = useChannelBots(props)
const isEditing = ref(false)
const draftName = ref('')
const pendingAction = ref<'name' | 'archive' | null>(null)
const nameError = ref<string | null>(null)
const archiveError = ref<string | null>(null)

const startEditing = () => {
  if (!canEdit.value || pendingAction.value || !thread.value) return
  draftName.value = thread.value.name
  nameError.value = null
  isEditing.value = true
}
const cancelEditing = () => {
  if (pendingAction.value) return
  isEditing.value = false
  nameError.value = null
  draftName.value = thread.value?.name ?? ''
}
const save = async (action: 'name' | 'archive', patch: PatchThreadRequest) => {
  if (!canEdit.value || pendingAction.value || !thread.value) return
  const id = props.channelId
  pendingAction.value = action
  nameError.value = archiveError.value = null
  try {
    await apis.editThread(id, patch)
    if (action === 'name') isEditing.value = false
  } catch (error) {
    const status = isAxiosError(error) ? error.response?.status : undefined
    if (action === 'name') {
      nameError.value =
        status === 409
          ? 'この名前は使用できません'
          : '名前の保存に失敗しました。もう一度お試しください'
    } else {
      archiveError.value =
        'アーカイブ状態の変更に失敗しました。もう一度お試しください'
    }
  } finally {
    pendingAction.value = null
  }
}
const saveName = (name: string) => {
  if (name.length > 0) return save('name', { name })
}
const toggleArchive = () => {
  if (!thread.value || isEditing.value) return
  return save('archive', { archived: !thread.value.archived })
}
</script>

<style lang="scss" module>
.content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  // 320pxのサイドバー内でスクロールバーの予約幅による縮小を防ぐ。
  width: 256px;
}
.archive {
  padding: 8px;
}
.archiveButton {
  width: 100%;
}
.error {
  @include size-body2;
  margin-top: 8px;
  color: $theme-accent-error-default;
}
</style>
