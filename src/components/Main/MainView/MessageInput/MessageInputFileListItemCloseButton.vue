<template>
  <div
    @click="context.emit('click')"
    :class="$style.container"
    :style="styles.container"
  >
    <icon mdi name="close" :size="12" />
  </div>
</template>

<script lang="ts">
import { defineComponent, SetupContext, reactive } from '@vue/composition-api'
import Icon from '@/components/UI/Icon.vue'
import { makeStyles } from '@/lib/styles'
import { transparentize } from '@/lib/util/color'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.background.primary,
      background: transparentize(theme.ui.primary, 0.8)
    }))
  })

export default defineComponent({
  name: 'MessageInputFileListItem',
  components: {
    Icon
  },
  setup(_, context: SetupContext) {
    const styles = useStyles()
    return { styles, context }
  }
})
</script>

<style lang="scss" module>
.container {
  width: 16px;
  height: 16px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
</style>
