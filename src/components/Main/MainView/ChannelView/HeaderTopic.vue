<template>
  <div v-if="topic" :class="$style.container">
    <inline-markdown
      :class="$style.topic"
      :content="topic"
      :title="topic"
      accept-action
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { ChannelId } from '/@/types/entity-ids'
import InlineMarkdown from '/@/components/UI/InlineMarkdown.vue'
import { useChannelsStore } from '/@/store/entities/channels'

export default defineComponent({
  name: 'HeaderTopic',
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
    const topic = computed(() => channelsMap.value.get(props.channelId)?.topic)
    return { topic }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  height: 16px;
  padding: 0 16px;
  border-left: {
    style: solid;
    width: 2px;
    color: $theme-ui-tertiary-default;
  }
  [data-is-mobile] & {
    padding-left: 12px;
    padding-right: 4px;
  }
}
.topic {
  @include size-body2;
  width: 100%;
  font-weight: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
