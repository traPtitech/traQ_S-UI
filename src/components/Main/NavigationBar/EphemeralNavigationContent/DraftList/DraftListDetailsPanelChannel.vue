<template>
  <router-link :to="channelLink">
    <div :class="$style.container">
      <div :class="$style.state">
        <a-icon v-if="hasAttachments" name="file" mdi :class="$style.icon" />
        <div
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
import AIcon from '/@/components/UI/AIcon.vue'
import { computed, ref, watchEffect } from 'vue'
import type { MessageInputState } from '/@/store/ui/messageInputStateStore'
import type { ChannelId } from '/@/types/entity-ids'
import useChannelPath from '/@/composables/useChannelPath'
import { renderInline } from '/@/lib/markdown/markdown'

const props = defineProps<{
  channelId: ChannelId
  state: MessageInputState
}>()

const { channelIdToShortPathString, channelIdToLink } = useChannelPath()

const channelPath = computed(() =>
  channelIdToShortPathString(props.channelId, true)
)
const channelLink = computed(() => channelIdToLink(props.channelId))
const hasAttachments = computed(() => props.state.attachments.length > 0)

const renderedContent = ref()
watchEffect(async () => {
  const { renderedText } = await renderInline(props.state.text)
  renderedContent.value = renderedText
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
