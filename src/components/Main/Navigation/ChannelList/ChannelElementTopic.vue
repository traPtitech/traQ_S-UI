<template>
  <div :class="$style.container">
    {{ topic }}
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from '@vue/composition-api'
import store from '@/store'
import { ChannelId } from '@/types/entity-ids'

export default defineComponent({
  name: 'ChannelElementTopic',
  props: {
    channelId: {
      type: String as PropType<ChannelId>,
      required: true
    }
  },
  setup(props) {
    const topic = computed(
      () => store.state.entities.channels[props.channelId]?.topic ?? ''
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
