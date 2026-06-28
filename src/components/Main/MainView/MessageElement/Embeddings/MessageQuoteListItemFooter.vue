<template>
  <div :class="$style.container">
    <span :class="$style.description">
      <span v-if="disableLinks">
        {{ channelPath }}
      </span>
      <router-link v-else :to="channelLink">
        {{ channelPath }}
      </router-link>
      -
      <time :datetime="date.toISOString()">{{
        getDateRepresentation(date)
      }}</time>
    </span>
    <MessageLink
      v-if="!disableLinks"
      :class="$style.link"
      :message-id="message?.id ?? ''"
    >
      メッセージへ
    </MessageLink>
  </div>
</template>

<script lang="ts" setup>
import type { Message } from '@traptitech/traq'

import { type DeepReadonly, computed } from 'vue'

import MessageLink from '/@/components/UI/MessageLink.vue'
import useChannelPath from '/@/composables/useChannelPath'
import { getDateRepresentation } from '/@/lib/basic/date'

const props = withDefaults(
  defineProps<{
    message: DeepReadonly<Message>
    date?: Date
    disableLinks?: boolean
  }>(),
  {
    disableLinks: false
  }
)

const { channelIdToPathString, channelIdToLink } = useChannelPath()

const channelPath = computed(
  () => channelIdToPathString(props.message.channelId, true) ?? ''
)
const channelLink = computed(
  () => channelIdToLink(props.message.channelId) ?? ''
)
const date = computed(() => props.date ?? new Date(props.message.createdAt))
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  @include size-body2;
  align-self: end;
  word-break: keep-all;
  overflow-wrap: anywhere;
  min-width: 0;
}
.description {
  font-weight: normal;
  margin-right: 8px;
}
.link {
  font-weight: bold;
}
</style>
