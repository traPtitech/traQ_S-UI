<template>
  <div :class="$style.container" :style="styles.container">
    <icon mdi name="close" :size="12" />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  SetupContext,
  computed,
  reactive,
  ref,
  Ref
} from '@vue/composition-api'
import store from '@/store'
import Icon from '@/components/UI/Icon.vue'
import { makeStyles } from '@/lib/styles'
import { transparentize } from '@/lib/util/color'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: transparentize(theme.ui.primary, 0.8)
    }))
  })

export default defineComponent({
  name: 'MessageInputFileListItem',
  components: {
    Icon
  },
  setup() {
    const styles = useStyles()
    return { styles }
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
  color: #ffffff;
  cursor: pointer;
}
</style>
