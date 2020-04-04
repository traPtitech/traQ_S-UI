<template>
  <div :class="$style.container">
    <span :class="$style.hr" :style="styles.hr"></span>
    <span :class="$style.label" :style="styles.label">
      {{ props.label }}
    </span>
    <span :class="$style.hr" :style="styles.hr"></span>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'

type Props = {
  label: string
}

const useStyles = () =>
  reactive({
    hr: makeStyles(theme => ({
      background: theme.ui.tertiary
    })),
    label: makeStyles(theme => ({
      color: theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'AuthenticateSeparator',
  props: {
    label: {
      type: String,
      default: ''
    }
  },
  setup(props: Props) {
    const styles = useStyles()
    return { props, styles }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
}
.hr {
  width: 100%;
  height: 2px;
}
.label {
  margin: 0 16px;
  flex-shrink: 0;
  font-weight: bold;
}
</style>
