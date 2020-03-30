<template>
  <div :class="$style.container">
    <stamp-picker-stamp-list-item
      v-for="stamp in props.stamps"
      :key="stamp.id"
      :stamp-id="stamp.id"
      @click="onClickStamp(stamp.id)"
      @hover="onStampHover(stamp.name)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, SetupContext } from '@vue/composition-api'
import store from '@/store'
import StampPickerStampListItem from './StampPickerStampListItem.vue'
import { StampId } from '@/types/entity-ids'
import { Stamp } from '@traptitech/traq'

type Props = {
  stamps: Stamp[]
}

export default defineComponent({
  name: 'StampPickerStampList',
  components: {
    StampPickerStampListItem
  },
  props: {
    stamps: {
      type: Array,
      required: true
    }
  },
  setup(props: Props, context: SetupContext) {
    const onClickStamp = (id: StampId) => {
      context.emit('input-stamp', id)
    }
    const onStampHover = (name: string) => {
      context.emit('hover-stamp', name)
    }
    return { props, onClickStamp, onStampHover }
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
</style>
