<template>
  <div></div>
</template>

<script lang="ts">
import { defineComponent, SetupContext } from '@vue/composition-api'
import store from '@/store'

type Props = {}

export default defineComponent({
  name: 'MessageInputFileInput',
  setup(props: Props, context: SetupContext) {
    return {}
  }
})
</script>

<style lang="scss" module>
.container {
  width: 100%;
  max-height: 10rem;
  resize: none;
  height: 1rem;
}
.fileDragDropContainer {
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>
