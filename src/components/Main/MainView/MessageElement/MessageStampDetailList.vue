<template>
  <div :class="$style.container" :style="styles.container">
    <stamp-detail-element
      :class="$style.element"
      v-for="(stamps, stampId) in state.stampsById"
      :key="stampId"
      :stamp-id="stampId"
      :stamps="stamps"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  PropType,
  computed
} from '@vue/composition-api'

import { makeStyles } from '@/lib/styles'
import { MessageStamp } from '@traptitech/traq'
import { reduceToRecordOfArray } from '@/lib/util/record'
import StampDetailElement from './StampDetailElement.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({}))
  })

export default defineComponent({
  name: 'MessageStampDetailList',
  components: {
    StampDetailElement
  },
  props: {
    stamps: {
      type: Array as PropType<MessageStamp[]>,
      required: true
    }
  },
  setup(props) {
    const styles = useStyles()
    const state = reactive({
      stampsById: computed(() => reduceToRecordOfArray(props.stamps, 'stampId'))
    })
    return { styles, state }
  }
})
</script>

<style lang="scss" module>
.container {
}
</style>
