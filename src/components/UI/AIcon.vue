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
import { shallowRef, watch, computed } from 'vue'
import type { Component } from 'vue'
import mdiPaths from '/@/assets/mdi'

type ComponentModule = {
  default: Component
}

const iconModules0 = import.meta.glob<ComponentModule>(
  '/src/assets/icons/*.svg'
  /* ?component や as: 'component'が効かないのでdefaultImportオプションで指定 */
)
const iconModules1 = import.meta.glob<ComponentModule>(
  '/src/assets/icons/*/*.svg'
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

const getComponent = async (name: string) => {
  const moduleFunc = iconModules[`/src/assets/icons/${name}.svg`]
  if (!moduleFunc) {
    throw new Error(`存在しないアイコン名: ${name}`)
  }

  const module = await moduleFunc()
  return module.default
}

const svgComponent = shallowRef()
watch(
  () => props.name,
  async () => {
    if (props.mdi) return
    const name = props.name
    const com = await getComponent(name)
    if (props.name !== name) return // 取得中にnameが変わったら何もしない
    svgComponent.value = com
  },
  { immediate: true }
)

const path = computed(() => mdiPaths[props.name])
</script>

<style lang="scss" module>
.icon {
  contain: strict;
}
</style>
