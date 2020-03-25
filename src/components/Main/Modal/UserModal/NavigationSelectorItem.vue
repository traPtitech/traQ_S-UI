<template>
  <button :class="$style.item" :style="styles.item">
    <icon :name="iconName" :mdi="iconMdi" :width="size" :height="size" />
  </button>
</template>

<script lang="ts">
import { defineComponent, SetupContext, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import { NavigationItemType } from './use/navigation'
import Icon from '@/components/UI/Icon.vue'

const useStyles = (props: Props, size: number) =>
  reactive({
    item: makeStyles(theme => ({
      color: props.isSelected ? theme.accent.primary : theme.ui.secondary,
      borderColor: props.isSelected ? theme.accent.primary : 'transparent',
      width: `${size}px`,
      height: `${size}px`
    }))
  })

type Props = {
  iconName: string
  iconMdi?: boolean
  isSelected: boolean
}

export default defineComponent({
  name: 'NavigationSelectorItem',
  components: { Icon },
  props: {
    iconName: {
      type: String,
      required: true
    },
    iconMdi: Boolean,
    isSelected: {
      type: Boolean,
      required: true
    }
  },
  setup(props: Props, context: SetupContext) {
    const size = 24
    const styles = useStyles(props, size)
    return {
      styles,
      props,
      size
    }
  }
})
</script>

<style lang="scss" module>
.item {
  box-sizing: content-box;
  padding: 4px;
  border-left: 4px solid;
  cursor: pointer;
}
</style>
