<template>
  <div v-if="topic" :class="$style.container">
    <div :class="$style.topic" :title="topic">{{ topic }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'
import store from '@/store'

export default defineComponent({
  name: 'MainViewHeaderTopic',
  props: {
    channelId: {
      type: String as PropType<ChannelId>,
      required: true
    }
  },
  setup(props) {
    const topic = computed(
      () => store.state.entities.channels[props.channelId]?.topic
    )
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
    color: $theme-ui-tertiary;
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
