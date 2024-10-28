<template>
  <div :class="$style.container">
    <span :class="$style.description">
      <router-link :to="channelLink">
        {{ channelPath }}
      </router-link>
      - {{ date }}
    </span>
    <router-link :class="$style.link" :to="messageLink">
      メッセージへ
    </router-link>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { Message } from '@traptitech/traq'
import useChannelPath from '/@/composables/useChannelPath'
import { getDateRepresentation } from '/@/lib/basic/date'
import { constructMessagesPath } from '/@/router'

const props = defineProps<{
  message?: Message
}>()

const { channelIdToPathString, channelIdToLink } = useChannelPath()

const channelPath = computed(() =>
  props.message ? channelIdToPathString(props.message.channelId, true) : ''
)
const channelLink = computed(() =>
  props.message ? channelIdToLink(props.message.channelId) : ''
)
const date = computed(() =>
  props.message ? getDateRepresentation(props.message.createdAt) : ''
)
const messageLink = computed(() =>
  props.message ? constructMessagesPath(props.message.id) : ''
)
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  @include size-body2;
  padding-left: 8px;
  align-self: end;
  word-break: keep-all;
  overflow-wrap: break-word; // for Safari
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
