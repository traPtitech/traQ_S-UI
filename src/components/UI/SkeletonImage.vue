<template>
  <div
    v-if="background"
    v-bind="$attrs"
    :style="[skeletonStyle, backgroundStyle]"
  >
    <slot />
  </div>
  <template v-else>
    <span
      v-if="!src || !isImageLoaded"
      :class="$style.skeleton"
      v-bind="$attrs"
      :style="skeletonStyle"
    />
    <img
      v-show="isImageLoaded"
      v-if="src && !background"
      :src="src"
      v-bind="$attrs"
      @load="onImageLoad"
    />
    <slot />
  </template>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'

import { isNumber } from '/@/lib/basic/arithmetic'

defineOptions({
  inheritAttrs: false
})

const props = withDefaults(
  defineProps<{
    src?: string
    fixed?: boolean
    height?: number | string
    width?: number | string
    background?: boolean
  }>(),
  {
    background: false,
    fixed: false,
    height: 'auto',
    width: 'auto'
  }
)

const emit = defineEmits<{
  load: []
}>()

const isImageLoaded = ref(false)

const onImageLoad = () => {
  isImageLoaded.value = true
  emit('load')
}

watch(
  () => props.src,
  src => {
    if (!src) return
    if (!props.background) return

    isImageLoaded.value = false
    const img = new Image()
    img.src = src
    img.onload = () => {
      isImageLoaded.value = true
      emit('load')
    }
  },
  { immediate: true }
)

const backgroundStyle = computed(() => {
  return {
    backgroundImage: isImageLoaded.value ? `url(${props.src})` : 'none'
  }
})

const skeletonStyle = computed(() => {
  if (props.fixed) {
    return {
      width: isNumber(props.width) ? `${props.width}px` : props.width,
      height: isNumber(props.height) ? `${props.height}px` : props.height
    }
  } else {
    return {
      aspectRatio: `${props.width} / ${props.height}`
    }
  }
})
</script>

<style lang="scss" module>
.container {
  position: relative;
  max-width: 100%;
  max-height: 100%;
}

.skeleton {
  display: block;
  background: linear-gradient(
    90deg,
    $theme-background-secondary-default 25%,
    $theme-background-tertiary-default 50%,
    $theme-background-secondary-default 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
