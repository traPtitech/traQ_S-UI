<template>
  <div :class="$style.container" @click="changeChannel">
    <div :class="$style.state">
      <icon v-if="hasAttachments" name="file" mdi :class="$style.icon" />
      <div :class="$style.text" v-html="renderedContent"></div>
    </div>
    <div :class="$style.channelPath">{{ channelPath }}</div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, watchEffect } from 'vue'
import { MessageInputState } from '@/providers/messageInputState'
import { ChannelId } from '@/types/entity-ids'
import useChannelPath from '@/use/channelPath'
import Icon from '@/components/UI/Icon.vue'
import { changeChannelById } from '@/router/channel'
import { renderInline } from '@/lib/markdown/markdown'

export default defineComponent({
  name: 'InputStateChannel',
  components: {
    Icon
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
    const { channelIdToPathString } = useChannelPath()

    const changeChannel = () => {
      changeChannelById(props.channelId)
    }

    const channelPath = computed(() =>
      channelIdToPathString(props.channelId, true)
    )
    const hasAttachments = computed(() => props.state.attachments.length > 0)

    const renderedContent = ref()
    watchEffect(async () => {
      const { renderedText } = await renderInline(props.state.text)
      renderedContent.value = renderedText
    })

    return { changeChannel, channelPath, hasAttachments, renderedContent }
  }
})
</script>

<style lang="scss" module>
.container {
  cursor: pointer;
}
.state {
  display: flex;
}
.icon {
  flex-shrink: 0;
}
.text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.channelPath {
  @include color-text-secondary;
  @include size-caption;
}
</style>
