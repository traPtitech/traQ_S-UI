<template>
  <div :class="$style.container">
    <inline-markdown :content="topic" :title="topic" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import { ChannelId } from '/@/types/entity-ids'
import InlineMarkdown from '/@/components/UI/InlineMarkdown.vue'
import { useChannelsStore } from '/@/store/entities/channels'

export default defineComponent({
  name: 'ChannelElementTopic',
  components: {
    InlineMarkdown
  },
  props: {
    channelId: {
      type: String as PropType<ChannelId>,
      required: true
    }
  },
  setup(props) {
    const { channelsMap } = useChannelsStore()
    const topic = computed(
      () => channelsMap.value.get(props.channelId)?.topic ?? ''
    )
    return { topic }
  }
})
</script>

<style lang="scss" module>
.container {
  @include size-body2;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;

  cursor: pointer;
}
</style>
