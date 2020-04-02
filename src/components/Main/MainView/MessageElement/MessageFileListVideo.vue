<template>
  <div :class="$style.container">
    <div>
      {{ fileId }}
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  computed,
  reactive,
  onBeforeMount
} from '@vue/composition-api'
import { FileId } from '@/types/entity-ids'

export default defineComponent({
  name: 'MessageFileListVideo',
  props: {
    fileId: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    return {}
  }
})
</script>

<style lang="scss" module>
.container {
}
</style>
