<template>
  <div :class="$style.container"></div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import store from '/@/store'
import { StampId } from '/@/types/entity-ids'
import { buildFilePath } from '/@/lib/apis'

export default defineComponent({
  name: 'StampPickerEffectSelector',
  props: {
    stampId: {
      type: String as PropType<StampId>,
      required: true
    }
  },
  setup(props) {
    const fileId =
      store.state.entities.stampsMap.get(props.stampId)?.fileId ?? ''
    const imageUrl = fileId ? `${buildFilePath(fileId)}` : ''
    return { imageUrl }
  }
})
</script>

<style lang="scss" module>
.container {
  padding: 8px;
}
</style>
