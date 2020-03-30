<template>
  <div :class="$style.circle" :style="styles.icon">
    <icon
      :class="$style.icon"
      :name="props.name"
      :mdi="props.mdi"
      :width="props.width"
      :height="props.height"
      :color="props.color"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'

const useStyles = (props: {
  background: string
  width: number
  height: number
}) => {
  return reactive({
    icon: makeStyles(theme => ({
      background: props.background,
      width: `${props.width}px`,
      height: `${props.height}px`
    }))
  })
}

type Props = {
  color: string
  background: string
  name: string
  mdi?: boolean
  width: number
  height: number
}

export default defineComponent({
  name: 'CircleIcon',
  components: { Icon },
  props: {
    color: {
      type: String,
      required: true
    },
    background: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    mdi: Boolean,
    width: {
      type: Number,
      default: 24
    },
    height: {
      type: Number,
      default: 24
    }
  },
  setup(props: Props) {
    const styles = useStyles(props)
    return { props, styles }
  }
})
</script>

<style lang="scss" module>
.circle {
  border-radius: 50%;
}
.icon {
  padding: 10%;
}
</style>
