<template>
  <div @click="context.emit('click')" :class="$style.container">
    <stamp :stamp-id="stampId" :size="size" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'
import store from '@/store'
import { StampId } from '@/types/entity-ids'
import { buildFilePath } from '@/lib/apis'
import Stamp from '@/components/UI/Stamp.vue'

export default defineComponent({
  name: 'StampPickerStampListItem',
  components: {
    Stamp
  },
  props: {
    stampId: {
      type: String as PropType<StampId>,
      required: true
    },
    size: { type: Number, default: 24 }
  },
  setup(props, context) {
    const fileId = store.state.entities.stamps[props.stampId]?.fileId ?? ''
    const imageUrl = fileId ? `${buildFilePath(fileId)}` : ''
    return { context, imageUrl }
  }
})
</script>

<style lang="scss" module>
.container {
  &:hover {
    @include background-secondary;
  }
}
</style>
