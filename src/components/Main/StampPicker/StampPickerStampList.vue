<template>
  <div :class="$style.container">
    <stamp-picker-stamp-list-item
      v-for="stamp in stamps"
      :key="stamp.id"
      :stamp-id="stamp.id"
      :class="$style.stampListItem"
      @click="onClickStamp(stamp.id)"
      @hover="onStampHover(stamp.name)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'
import StampPickerStampListItem from './StampPickerStampListItem.vue'
import { StampId } from '@/types/entity-ids'
import { Stamp } from '@traptitech/traq'

export default defineComponent({
  name: 'StampPickerStampList',
  components: {
    StampPickerStampListItem
  },
  props: {
    stamps: {
      type: Array as PropType<Stamp[]>,
      required: true
    }
  },
  setup(props, context) {
    const onClickStamp = (id: StampId) => {
      context.emit('input-stamp', id)
    }
    const onStampHover = (name: string) => {
      context.emit('hover-stamp', name)
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
}

.stampListItem {
  width: 32px;
  height: 32px;
  padding: 4px;
  cursor: pointer;
  user-select: none;
}
</style>
