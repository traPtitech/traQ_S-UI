<template>
  <button
    :class="$style.container"
    :style="styles.container"
    :title="title"
    @click="$emit('click')"
  >
    <Icon :size="22" :class="$style.icon" :name="iconName" :mdi="iconMdi" />
  </button>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'
import { transparentize } from '@/lib/util/color'

const useStyles = (props: { value: boolean }) =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.primary,
      color: props.value
        ? theme.accent.primary
        : transparentize(theme.ui.secondary, 0.5)
    }))
  })

export default defineComponent({
  name: 'ToggleButton',
  props: {
    iconName: {
      type: String,
      required: true
    },
    iconMdi: {
      type: Boolean,
      default: false
    },
    value: {
      type: Boolean,
      default: false
    },
    title: String
  },
  setup(props) {
    const styles = useStyles(props)
    return { styles }
  },
  components: {
    Icon
  }
})
</script>

<style lang="scss" module>
.container {
  padding: 4px 32px;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
}

.icon {
  vertical-align: middle;
}
</style>
