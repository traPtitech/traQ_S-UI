<template>
  <button
    :class="$style.container"
    :style="styles.container"
    @click="context.emit('click')"
  >
    <icon name="effect" />
  </button>
</template>
<script lang="ts">
import { defineComponent, SetupContext, reactive } from '@vue/composition-api'
import Icon from '@/components/UI/Icon.vue'
import { makeStyles } from '@/lib/styles'
import { transparentize } from '@/lib/util/color'

type Props = {
  isActive: boolean
}

const useStyles = (props: Props) =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.secondary,
      color: props.isActive
        ? theme.accent.primary
        : transparentize(theme.ui.secondary, 0.5),
      borderColor: props.isActive ? theme.accent.primary : 'transparent'
    }))
  })

export default defineComponent({
  name: 'StampPickerEffectToggleButton',
  components: {
    Icon
  },
  props: {
    isActive: { type: Boolean, default: false }
  },
  setup(props: Props, context: SetupContext) {
    const styles = useStyles(props)
    return { context, styles }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 30px;
  border: {
    radius: 4px;
    width: 2px;
    style: solid;
  }
  cursor: pointer;
}
</style>
