<template>
  <router-link :to="channelLink">
    <div :class="$style.container">
      <div :class="$style.state">
        <AIcon v-if="hasAttachments" name="file" mdi :class="$style.icon" />
        <bdi
          class="markdown-inline-body"
          :class="$style.text"
          v-html="renderedContent"
        />
      </div>
      <div :class="$style.channelPath">
        {{ channelPath }}
      </div>
    </div>
  </router-link>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import AIcon from '/@/components/UI/AIcon.vue'
import { useRenderedMarkdown } from '/@/composables/markdown/useRenderedMarkdown'
import useChannelPath from '/@/composables/useChannelPath'
import type { ReadonlyMessageInputState } from '/@/store/ui/messageInputStateStore'
import type { ChannelId } from '/@/types/entity-ids'

const props = defineProps<{
  channelId: ChannelId
  state: ReadonlyMessageInputState
}>()

const { channelIdToShortPathString, channelIdToLink } = useChannelPath()

const channelPath = computed(
  () => channelIdToShortPathString(props.channelId, true) ?? ''
)
const channelLink = computed(() => channelIdToLink(props.channelId) ?? '')
const hasAttachments = computed(() => props.state.attachments.length > 0)

const { renderedContent } = useRenderedMarkdown(() => props.state.text, {
  inline: true
})
</script>

<style lang="scss" module>
.container {
  cursor: pointer;
}
.state {
  @include color-ui-primary;
  display: flex;
}
.icon {
  flex-shrink: 0;
}
.text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  a {
    pointer-events: none;
  }
}
.channelPath {
  @include color-ui-secondary;
  @include size-caption;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
