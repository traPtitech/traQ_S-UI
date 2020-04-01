<template>
  <h2 :class="$style.header" :style="styles.header">{{ props.text }}</h2>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'

const useStyles = () =>
  reactive({
    header: makeStyles(theme => ({
      color: theme.ui.tertiary
    }))
  })

type Props = {
  text: string
}

export default defineComponent({
  name: 'ProfileHeader',
  props: {
    text: {
      type: String,
      required: true
    }
  },
  setup(props: Props) {
    const styles = useStyles()
    return {
      styles,
      props
    }
  }
})
</script>

<style lang="scss" module>
.header {
  font-size: 14px;
  margin-top: 16px;
  margin-bottom: 8px;
}
</style>
