<template>
  <span v-if="latestMessage" :class="$style.container">
    <UserIcon :user-id="latestMessage.userId" :size="20" prevent-modal />
    <RenderContent :class="$style.content" :content="latestMessage.content" />
  </span>
</template>

<script lang="ts" setup>
import type { Message } from '@traptitech/traq'

import RenderContent from '/@/components/UI/MessagePanel/RenderContent.vue'
import UserIcon from '/@/components/UI/UserIcon.vue'

defineProps<{
  latestMessage?: Pick<Message, 'content' | 'userId'>
}>()
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  @include size-caption;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  overflow: hidden;
  line-height: 20px;
}

.content {
  flex: 1;
  min-width: 0;
  width: auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: inherit;
  font-size: inherit;
}
</style>
