<template>
  <div :class="$style.container"></div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  computed,
  SetupContext
} from '@vue/composition-api'
import store from '@/store'
import { StampId } from '@/types/entity-ids'
import { makeStyles } from '@/lib/styles'
import { buildStampImagePath } from '@/lib/api'

type Props = {
  stampId: StampId
}

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.secondarySub
    }))
  })

export default defineComponent({
  name: 'StampPickerEffectSelector',
  props: {
    stampId: {
      type: String,
      required: true
    }
  },
  setup(props: Props, context: SetupContext) {
    const fileId = store.state.entities.stamps[props.stampId]?.fileId ?? ''
    const imageUrl = fileId ? `${buildStampImagePath(fileId)}` : ''
    return { imageUrl }
  }
})
</script>

<style lang="scss" module>
.container {
  padding: 8px;
}
</style>
