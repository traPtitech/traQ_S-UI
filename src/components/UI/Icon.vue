<template>
  <svg
    :width="props.size"
    :height="props.size"
    viewBox="0 0 24 24"
    class="icon"
    :style="{ color: props.color }"
    v-bind="context.attrs"
    v-on="context.listeners"
    role="img"
  >
    <title>{{ props.title || props.name }}</title>
    <desc v-if="props.desc">{{ props.desc }}</desc>
    <path :d="getPath(props.name)" />
  </svg>
</template>

<script lang="ts">
import { defineComponent, SetupContext } from '@vue/composition-api'
import icons from '@/assets/icons'

interface Props {
  name: string
  title?: string
  desc?: string
  size?: number
  color?: string
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
      default: 'black'
    }
  },
  setup(props: Props, context: SetupContext) {
    const getPath = (name: string) => {
      return icons[name]
    }

    return {
      props,
      context,
      getPath
    }
  }
})
</script>

<style lang="scss">
.icon {
  fill: currentColor;
}
</style>
