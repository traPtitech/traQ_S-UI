<template>
  <div
    :class="$style.container"
    :style="styles.container"
    :aria-selected="isSelected"
  >
    <icon :class="$style.icon" :name="iconName" :mdi="iconMdi" :size="24" />
    <div v-if="hasNotification" :class="$style.indicator">
      <notification-indicator :size="6" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from 'vue'
import { makeStyles, ThemeClaim } from '/@/lib/styles'
import Icon from '/@/components/UI/Icon.vue'
import NotificationIndicator from '/@/components/UI/NotificationIndicator.vue'

const useStyles = (props: { colorClaim?: ThemeClaim<string> }) => {
  return reactive({
    container: makeStyles((theme, common) => ({
      color: props.colorClaim?.(theme, common)
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
  @include color-accent-primary;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 100vw;
  cursor: pointer;
  &::after {
    content: '';
    position: absolute;
    display: block;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    border-radius: 100vw;
    background: currentColor;
    opacity: 0;
  }
  &[aria-selected='true']::after {
    opacity: 0.1;
  }
}
.icon {
  width: 24px;
  height: 24px;
  opacity: 0.3;
  &:hover {
    opacity: 0.7;
  }
  .container[aria-selected='true'] & {
    opacity: 1;
  }
}
.indicator {
  position: absolute;
  top: 8px;
  right: 8px;
}
</style>
