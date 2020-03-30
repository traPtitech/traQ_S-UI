<template>
  <div :class="$style.circle" :style="styles.icon">
    <icon
      :class="$style.icon"
      :name="props.name"
      :mdi="props.mdi"
      :size="props.innerSize"
      :color="props.color"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'

const useStyles = (props: { background: string; size: number }) => {
  return reactive({
    icon: makeStyles(theme => ({
      background: props.background,
      width: `${props.size}px`,
      height: `${props.size}px`
    }))
  })
}

type Props = {
  color: string
  background: string
  name: string
  mdi?: boolean
  innerSize: number
  size: number
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
    innerSize: {
      type: Number,
      default: 22
    },
    size: {
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.icon {
  padding: 10%;
}
</style>
