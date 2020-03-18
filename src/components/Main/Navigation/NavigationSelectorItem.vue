<template>
  <div :class="$style.container" :style="styles.container">
    <div :class="$style.icon" :style="styles.icon">
      <icon
        :name="props.iconName"
        :mdi="props.iconMdi"
        :width="24"
        :height="24"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles, fade } from '../../../lib/styles'
import Icon from '@/components/UI/Icon.vue'

const useStyles = (props: { isSelected: boolean }) => {
  return reactive({
    container: makeStyles(theme => ({
      background: props.isSelected ? fade(theme.accent.primary, 0.1) : 'none'
    })),
    icon: makeStyles(theme => ({
      color: theme.accent.primary,
      opacity: props.isSelected ? '1' : '0.3'
    }))
  })
}

type Props = {
  iconName: string
  iconMdi: boolean
  isSelected: boolean
  hasNotification: boolean
}

export default defineComponent({
  name: 'NavigationSelectorItem',
  components: { Icon },
  props: {
    iconName: {
      type: String,
      required: true
    },
    iconMdi: {
      type: Boolean,
      default: false
    },
    isSelected: {
      type: Boolean,
      default: false
    },
    hasNotification: {
      type: Boolean,
      default: false
    }
  },
  setup(props: Props) {
    const styles = useStyles(props)
    return { props, styles }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 100vw;
  cursor: pointer;
}
.icon {
  width: 24px;
  height: 24px;
}
</style>
