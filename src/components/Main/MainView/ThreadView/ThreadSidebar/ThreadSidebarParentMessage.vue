<template>
  <SidebarContentContainer title="親メッセージ">
    <MessagePanel
      v-if="loadState === 'ready' && message"
      :message="message"
      :to="constructMessagesPath(message.id)"
      title-type="user"
      line-clamp-content
      embedded
      :class="$style.message"
    />
    <EmptyState v-else-if="loadState === 'loading'" role="status">
      読み込み中…
    </EmptyState>
    <EmptyState v-else-if="loadState === 'failed'" role="alert">
      親メッセージを取得できませんでした
      <button type="button" :class="$style.retry" @click="load">再試行</button>
    </EmptyState>
    <EmptyState v-else>親メッセージは削除されたか、表示できません</EmptyState>
  </SidebarContentContainer>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'

import { isAxiosError } from 'axios'

import SidebarContentContainer from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarContentContainer.vue'
import EmptyState from '/@/components/UI/EmptyState.vue'
import MessagePanel from '/@/components/UI/MessagePanel/MessagePanel.vue'
import useMittListener from '/@/composables/utils/useMittListener'
import { constructMessagesPath } from '/@/router'
import { messageMitt, useMessagesStore } from '/@/store/entities/messages'
import type { MessageId } from '/@/types/entity-ids'

const props = defineProps<{ messageId: MessageId }>()
const { messagesMap, fetchMessage } = useMessagesStore()
const message = computed(() => messagesMap.value.get(props.messageId))
const loadState = ref<'loading' | 'ready' | 'unavailable' | 'failed'>('loading')
let request = 0

const load = async () => {
  const currentRequest = ++request
  loadState.value = 'loading'
  try {
    await fetchMessage({ messageId: props.messageId, ignoreCache: true })
    if (currentRequest === request) loadState.value = 'ready'
  } catch (error) {
    if (currentRequest !== request) return
    loadState.value =
      isAxiosError(error) && [403, 404].includes(error.response?.status ?? 0)
        ? 'unavailable'
        : 'failed'
  }
}
watch(() => props.messageId, load, { immediate: true })
useMittListener(messageMitt, 'reconnect', load)
</script>

<style lang="scss" module>
.message {
  min-width: 0;
  &:focus-visible {
    outline: 2px solid $theme-accent-focus-default;
    outline-offset: 2px;
  }
}
.retry {
  @include color-accent-primary;
  display: block;
  margin: 8px auto 0;
  cursor: pointer;
}
</style>
