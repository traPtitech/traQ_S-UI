<template>
  <svg
    v-if="mdi"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    class="icon"
    :style="{ color: color }"
    v-bind="context.attrs"
    v-on="context.listeners"
    role="img"
  >
    <title>{{ name }}</title>
    <path :d="getMdiPath(name)" />
  </svg>
  <component
    v-else
    :is="svgComponent"
    :width="size"
    :height="size"
    :style="{ color: color }"
    view-box="0 0 24 24"
    class="icon"
    v-bind="context.attrs"
    v-on="context.listeners"
    role="img"
  />
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
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
    color: {
      type: String,
      default: 'currentColor'
    },
    mdi: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const svgComponent = computed(() => () =>
      import(`@/assets/icons/${[props.name]}.svg`)
    )

    const getMdiPath = (name: string) => {
      return mdi[name]
    }

    return {
      context,
      svgComponent,
      getMdiPath
    }
  }
})
</script>

<style lang="scss">
.icon {
  fill: currentColor;
}
</style>
