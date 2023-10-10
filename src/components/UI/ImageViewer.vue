<template>
  <div ref="containerEle" :class="$style.container">
    <div :class="$style.imgContainer" :style="styles.imgContainer">
      <img
        ref="imgEle"
        :src="src"
        :alt="alt"
        :class="$style.img"
        :style="styles.img"
        draggable="false"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import useImageViewer from './composables/useImageViewer'

defineProps<{
  src?: string
  alt?: string
}>()

const containerEle = ref<HTMLDivElement>()
const imgEle = ref<HTMLImageElement>()

const { styles } = useImageViewer(containerEle, imgEle)
</script>

<style lang="scss" module>
.container {
  position: relative;
  overflow: hidden;
}
.imgContainer {
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
