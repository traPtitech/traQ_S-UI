<template>
  <div :class="$style.container" :style="styles.container">
    <div
      :class="$style.icon"
      :style="styles.icon"
      :data-is-selected="isSelected"
    >
      <icon :name="iconName" :mdi="iconMdi" :width="24" :height="24" />
    </div>
    <div v-if="hasNotification" :class="$style.indicator">
      <notification-indicator />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import { makeStyles, ThemeClaim } from '@/lib/styles'
import { transparentize } from '@/lib/util/color'
import Icon from '@/components/UI/Icon.vue'
import NotificationIndicator from '@/components/UI/NotificationIndiator.vue'

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
        : theme.accent.primary
    }))
  })
}

export default defineComponent({
  name: 'NavigationSelectorItem',
  components: { Icon, NotificationIndicator },
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
  position: relative;
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
  opacity: 0.3;
  &:hover {
    opacity: 0.7;
  }
  &[data-is-selected] {
    opacity: 1;
  }
}
.indicator {
  position: absolute;
  top: 1px;
  right: 1px;
}
</style>
