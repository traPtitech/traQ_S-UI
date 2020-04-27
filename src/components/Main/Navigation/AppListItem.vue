<template>
  <a
    :class="$style.container"
    :style="styles.container"
    :href="appLink"
    target="_blank"
    rel="noopener noreferrer"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <icon :class="$style.icon" :name="iconName" :mdi="iconMdi" :size="32" />
    <span :class="$style.label">{{ label }}</span>
  </a>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'
import useHover from '@/use/hover'

const useStyles = (hoverState: { hover: boolean }) =>
  reactive({
    container: makeStyles(theme => ({
      color: hoverState.hover ? theme.ui.primary : theme.ui.secondary,
      background: hoverState.hover
        ? theme.background.tertiary
        : theme.background.secondary
    }))
  })

export default defineComponent({
  name: 'AppListItem',
  components: {
    Icon
  },
  props: {
    iconName: { type: String, required: true },
    iconMdi: { type: Boolean, default: false },
    label: { type: String, default: '' },
    appLink: { type: String, default: '' }
  },
  setup() {
    const { hoverState, onMouseEnter, onMouseLeave } = useHover()
    const styles = useStyles(hoverState)
    return { styles, onMouseEnter, onMouseLeave }
  }
})
</script>

<style lang="scss" module>
.container {
  margin: 8px;
  padding: 16px 8px;
  border-radius: 8px;
  flex: 1 0;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  min-width: 120px;
}
.icon {
  margin: 4px;
}
.label {
  font-size: 1rem;
}
</style>
