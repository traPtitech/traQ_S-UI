<template>
  <svg
    v-if="mdi"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    v-bind="attrs"
    v-on="listeners"
    role="img"
    :class="$style.icon"
  >
    <path :d="getMdiPath(name)" fill="currentColor" />
  </svg>
  <component
    v-else
    :is="svgComponent"
    :width="size"
    :height="size"
    view-box="0 0 24 24"
    v-bind="attrs"
    v-on="listeners"
    role="img"
    :class="$style.icon"
  />
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import mdi from '@/assets/mdi'

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
  setup(props, { attrs, listeners }) {
    // ここでnameを束縛することでcomputed内で戻り値の関数がprops.nameに依存していることが伝わる？
    const getComponent = (name: string) => () =>
      import(`@/assets/icons/${name}.svg?component`)

    const svgComponent = computed(() => getComponent(props.name))
    const getMdiPath = (name: string) => {
      return mdi[name]
    }

    return { svgComponent, getMdiPath, attrs, listeners }
  }
})
</script>

<style lang="scss" module>
.icon {
  contain: strict;
}
</style>
