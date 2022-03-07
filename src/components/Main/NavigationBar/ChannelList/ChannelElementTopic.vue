<template>
  <div :class="$style.container">
    <inline-markdown :content="topic" :title="topic" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import store from '/@/vuex'
import { ChannelId } from '/@/types/entity-ids'
import InlineMarkdown from '/@/components/UI/InlineMarkdown.vue'

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
    const topic = computed(
      () => store.state.entities.channelsMap.get(props.channelId)?.topic ?? ''
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
