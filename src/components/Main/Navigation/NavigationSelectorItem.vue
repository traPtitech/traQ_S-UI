<template>
  <div :class="$style.container" :style="styles.container">
    <div :class="$style.icon" :style="styles.icon">
      <icon :name="iconName" :mdi="iconMdi" :width="24" :height="24" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import { makeStyles, ThemeClaim } from '@/lib/styles'
import { transparentize } from '@/lib/util/color'
import Icon from '@/components/UI/Icon.vue'

const useStyles = (props: {
  isSelected: boolean
  colorClaim?: ThemeClaim<string>
}) => {
  return reactive({
    container: makeStyles((theme, common) => ({
      background: props.isSelected
        ? transparentize(
            props.colorClaim
              ? props.colorClaim(theme, common)
              : theme.accent.primary,
            0.1
          )
        : 'none'
    })),
    icon: makeStyles((theme, common) => ({
      color: props.colorClaim
        ? props.colorClaim(theme, common)
        : theme.accent.primary,
      opacity: props.isSelected ? '1' : '0.3'
    }))
  })
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
    },
    colorClaim: Function as PropType<ThemeClaim<string>>
  },
  setup(props) {
    const styles = useStyles(props)
    return { styles }
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
