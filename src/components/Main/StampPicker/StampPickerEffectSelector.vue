<template>
  <div :class="$style.container"></div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { StampId } from '/@/types/entity-ids'
import { buildFilePath } from '/@/lib/apis'
import { useStampsStore } from '/@/store/entities/stamps'

export default defineComponent({
  name: 'StampPickerEffectSelector',
  props: {
    stampId: {
      type: String as PropType<StampId>,
      required: true
    }
  },
  setup(props) {
    const { stampsMap } = useStampsStore()
    const fileId = stampsMap.value.get(props.stampId)?.fileId ?? ''
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
