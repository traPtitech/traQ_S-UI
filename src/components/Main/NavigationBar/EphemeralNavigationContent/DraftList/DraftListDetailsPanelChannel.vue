<template>
  <router-link :to="channelLink">
    <div :class="$style.container">
      <div :class="$style.state">
        <a-icon v-if="hasAttachments" name="file" mdi :class="$style.icon" />
        <div
          :class="[$style.text, 'markdown-inline-body']"
          v-html="renderedContent"
        ></div>
      </div>
      <div :class="$style.channelPath">{{ channelPath }}</div>
    </div>
  </router-link>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, watchEffect } from 'vue'
import { MessageInputState } from '/@/providers/messageInputState'
import { ChannelId } from '/@/types/entity-ids'
import useChannelPath from '/@/use/channelPath'
import AIcon from '/@/components/UI/AIcon.vue'
import { renderInline } from '/@/lib/markdown/markdown'

export default defineComponent({
  name: 'DraftListDetailsPanelChannel',
  components: {
    AIcon
  },
  props: {
    channelId: {
      type: String as PropType<ChannelId>,
      required: true
    },
    state: {
      type: Object as PropType<MessageInputState>,
      required: true
    }
  },
  setup(props) {
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

    return { channelPath, channelLink, hasAttachments, renderedContent }
  }
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