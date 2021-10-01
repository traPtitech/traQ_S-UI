<template>
  <div :class="$style.container">
    <stamp-element
      v-for="stamp in stamps"
      :key="stamp.id"
      :stamp-id="stamp.id"
      :size="32"
      :class="$style.stampListItem"
      @click="onClickStamp(stamp.id)"
      @hover="onStampHover(stamp.name)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { StampId } from '/@/types/entity-ids'
import { Stamp } from '@traptitech/traq'
import StampElement from '/@/components/UI/Stamp.vue'

export default defineComponent({
  name: 'StampPickerStampList',
  components: {
    StampElement
  },
  props: {
    stamps: {
      type: Array as PropType<readonly Stamp[]>,
      required: true
    }
  },
  emits: {
    inputStamp: (_id: StampId) => true,
    hoverStamp: (_name: string) => true
  },
  setup(props, context) {
    const onClickStamp = (id: StampId) => {
      context.emit('inputStamp', id)
    }
    const onStampHover = (name: string) => {
      context.emit('hoverStamp', name)
    }
    return { onClickStamp, onStampHover }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-flow: row wrap;
  height: 100%;
  overflow-y: scroll;
  align-content: flex-start;
  backface-visibility: hidden;
  contain: content;
}

.stampListItem {
  padding: 4px;
  cursor: pointer;
  user-select: none;
  &:hover {
    @include background-secondary;
  }
}
</style>
