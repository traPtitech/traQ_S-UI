<template>
  <div :class="$style.container" :style="styles.container"></div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  computed,
  SetupContext
} from '@vue/composition-api'
import store from '@/store'
import { StampPaletteId } from '@/types/entity-ids'
import { makeStyles } from '@/lib/styles'
import { buildStampImagePath } from '@/lib/api'

type Props = {
  stampPaletteId: StampPaletteId
}

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.secondary
    }))
  })

export default defineComponent({
  name: 'StampPickerPaletteSelector',
  props: {
    stampPaletteId: {
      type: String,
      required: true
    }
  },
  setup(props: Props, context: SetupContext) {
    const styles = useStyles()
    return { styles }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  width: 100%;
  height: 36px;
  padding: 0 16px;
}
</style>
