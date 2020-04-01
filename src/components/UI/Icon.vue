<template>
  <svg
    v-if="mdi"
    :width="props.size"
    :height="props.size"
    viewBox="0 0 24 24"
    class="icon"
    :style="{ color: props.color }"
    v-bind="context.attrs"
    v-on="context.listeners"
    role="img"
  >
    <title>{{ props.name }}</title>
    <path :d="getMdiPath(props.name)" />
  </svg>
  <component
    v-else
    :is="svgComponent"
    :width="props.size"
    :height="props.size"
    :style="{ color: props.color }"
    viewBox="0 0 24 24"
    class="icon"
    v-bind="context.attrs"
    v-on="context.listeners"
    role="img"
  />
</template>

<script lang="ts">
import { defineComponent, SetupContext, computed } from '@vue/composition-api'
import mdi from '@/assets/mdi'

type Props = {
  name: string
  size?: number
  color?: string
  mdi?: boolean
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
    color: {
      type: String,
      default: 'currentColor'
    },
    mdi: {
      type: Boolean,
      default: false
    }
  },
  setup(props: Props, context: SetupContext) {
    const svgComponent = computed(() => () =>
      import(`@/assets/icons/${[props.name]}.svg`)
    )

    const getMdiPath = (name: string) => {
      return mdi[name]
    }

    return {
      props,
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
