<template>
  <svg
    v-if="mdi"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    v-bind="attrs"
    role="img"
    :class="$style.icon"
  >
    <path :d="getMdiPath(name)" fill="currentColor" />
  </svg>
  <component
    :is="svgComponent"
    v-else
    :width="size"
    :height="size"
    view-box="0 0 24 24"
    v-bind="attrs"
    role="img"
    :class="$style.icon"
  />
</template>

<script lang="ts">
import { defineComponent, shallowRef, watch } from 'vue'
import mdi from '/@/assets/mdi'

const iconModules0 = import.meta.glob('/src/assets/icons/*.svg')
const iconModules1 = import.meta.glob('/src/assets/icons/*/*.svg')

const iconModules = {
  ...iconModules0,
  ...iconModules1
}

export default defineComponent({
  name: 'Icon',
  props: {
    name: {
      type: String,
      required: true
    },
    title: String,
    desc: String,
    size: {
      type: Number,
      default: 24
    },
    mdi: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { attrs }) {
    const getComponent = async (name: string) => {
      const module = await iconModules[`/src/assets/icons/${name}.svg`]()
      return module.default
    }

    const svgComponent = shallowRef()
    watch(
      () => props.name,
      async () => {
        if (props.mdi) return
        const com = await getComponent(props.name)
        svgComponent.value = com
      },
      { immediate: true }
    )

    const getMdiPath = (name: string) => {
      return mdi[name]
    }

    return { svgComponent, getMdiPath, attrs }
  }
})
</script>

<style lang="scss" module>
.icon {
  contain: strict;
}
</style>
