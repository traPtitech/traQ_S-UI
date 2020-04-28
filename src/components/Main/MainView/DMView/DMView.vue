<template>
  <div :class="$style.container" :style="styles.container">
    <view-content :user-id="userId" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import { UserId } from '@/types/entity-ids'
import { makeStyles } from '@/lib/styles'
import ViewContent from './DMViewContent.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.primary,
      color: theme.ui.primary
    }))
  })

export default defineComponent({
  name: 'DMView',
  props: {
    userId: { type: String as PropType<UserId>, required: true }
  },
  components: { ViewContent },
  setup() {
    const styles = useStyles()

    return {
      styles
    }
  }
})
</script>

<style lang="scss" module>
.container {
  width: 100%;
  height: 100%;
}
</style>
