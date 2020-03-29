<template>
  <div :class="$style.container" :style="styles.container">
    <icon v-if="props.stampSetType === 'palette'" mdi name="home" />
    <icon
      v-else-if="props.stampSetType === 'category'"
      :name="`stampCategory/${props.stampSet}`"
    />
    <icon v-else-if="props.stampSetType === 'history'" mdi name="history" />
  </div>
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
import Icon from '@/components/UI/Icon.vue'

type Props = {
  stampSet: StampPaletteId | string | ''
  stampSetType: 'palette' | 'category' | 'history'
}

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.secondary
    }))
  })

export default defineComponent({
  name: 'StampPickerPaletteSelectorItem',
  components: {
    Icon
  },
  props: {
    stampSet: {
      type: String,
      default: ''
    },
    stampSetType: {
      type: String,
      required: true
    }
  },
  setup(props: Props, context: SetupContext) {
    const styles = useStyles()
    return { props, styles }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  width: 100%;
  height: 36px;
  cursor: pointer;
}
</style>
