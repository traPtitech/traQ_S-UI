<template>
  <div v-if="show" :class="$style.container" :style="styles.container">
    + Enterを押して{{ sendWithModifierKey === 'modifier' ? '送信' : '改行' }}
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.text.secondary
    }))
  })

export default defineComponent({
  name: 'MessageInputKeyGuide',
  props: {
    show: {
      type: Boolean,
      required: true
    }
  },
  setup() {
    const styles = useStyles()

    const sendWithModifierKey = computed(
      () => store.state.app.browserSettings.sendWithModifierKey
    )

    return { styles, sendWithModifierKey }
  }
})
</script>

<style lang="scss" module>
.container {
  position: absolute;
  top: 0;
  right: 0;
  transform: translateY(-100%);
}
</style>
