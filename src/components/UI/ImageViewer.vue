<template>
  <div ref="containerEle" :class="$style.container">
    <div :class="$style.imgContainer" :style="styles.imgContainer">
      <img
        :src="src"
        :class="$style.img"
        :style="styles.img"
        draggable="false"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import useImageViewer from './composables/useImageViewer'

export default defineComponent({
  name: 'ImageViewer',
  props: {
    src: {
      type: String,
      default: undefined
    }
  },
  setup(props) {
    const containerEle = ref<HTMLDivElement>()

    const { styles } = useImageViewer(containerEle)

    return { containerEle, styles }
  }
})
</script>

<style lang="scss" module>
.container {
  position: relative;
  overflow: hidden;
}
.imgContainer {
  position: absolute;
  top: 50%;
  left: 50%;
  height: 100%;
  width: 100%;
  user-select: none;
}
.img {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  max-height: 100%;
  max-width: 100%;
  margin: auto;
}
</style>
