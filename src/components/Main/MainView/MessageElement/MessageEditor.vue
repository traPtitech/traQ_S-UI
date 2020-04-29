<template>
  <div :class="$style.container" :style="styles.container">
    <textarea :value="rawContent" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'

import { makeStyles } from '@/lib/styles'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({}))
  })

export default defineComponent({
  name: 'MessageEditor',
  props: {
    rawContent: {
      type: String,
      required: true
    }
  },
  setup() {
    const styles = useStyles()
    return { styles }
  }
})
</script>

<style lang="scss" module>
.container {
}
</style>
