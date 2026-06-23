<template>
  <svg
    v-if="mdi"
    :width="size"
    :height="size"
    :viewBox="`0 0 24 24`"
    v-bind="$attrs"
    role="img"
    :class="$style.icon"
  >
    <path :d="path" fill="currentColor" />
  </svg>
  <component
    :is="svgComponent"
    v-else
    :width="size"
    :height="size"
    :viewBox="`0 0 ${size} ${size}`"
    v-bind="$attrs"
    role="img"
    :class="$style.icon"
  />
</template>

<script lang="ts">
import { computed } from 'vue'
import type { Component, SVGAttributes } from 'vue'

import mdiPaths from '/@/assets/mdi'

type ComponentModule = {
  default: Component
}

const iconModules0 = import.meta.glob<ComponentModule>(
  '/src/assets/icons/*.svg',
  { eager: true }
  /* ?component や as: 'component'が効かないのでdefaultImportオプションで指定 */
)
const iconModules1 = import.meta.glob<ComponentModule>(
  '/src/assets/icons/*/*.svg',
  { eager: true }
  /* 上記同様 */
)

const iconModules = {
  ...iconModules0,
  ...iconModules1
}
</script>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    name: string
    title?: string
    desc?: string
    size?: number
    mdi?: boolean
  }>(),
  {
    size: 24,
    mdi: false
  }
)

// eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type
interface Attributes extends /* @vue-ignore */ SVGAttributes {}

defineEmits<Attributes>()

const getComponent = (name: string) => {
  const module = iconModules[`/src/assets/icons/${name}.svg`]
  if (!module) {
    throw new Error(`存在しないアイコン名: ${name}`)
  }

  return module.default
}

const svgComponent = computed(() =>
  props.mdi ? undefined : getComponent(props.name)
)

const path = computed(() => mdiPaths[props.name])
</script>

<style lang="scss" module>
.icon {
  contain: var(--contain-strict);
}
</style>
