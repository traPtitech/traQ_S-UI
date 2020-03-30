<template>
  <div :class="$style.container" :style="styles.container">
    <icon v-if="props.stampSet.type === 'palette'" mdi name="home" />
    <icon
      v-else-if="props.stampSet.type === 'category'"
      :name="`stampCategory/${props.stampSet.id}`"
    />
    <icon v-else-if="props.stampSet.type === 'history'" mdi name="history" />
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
import { StampSet } from './use/stampSetSelector'

type Props = {
  stampSet: StampSet
  isActive: boolean
}

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.secondary
    }))
  })

export default defineComponent({
  name: 'StampPickerStampSetSelectorItem',
  components: {
    Icon
  },
  props: {
    stampSet: {
      type: Object,
      required: true
    },
    isActive: {
      type: Boolean,
      default: false
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
