<template>
  <div :class="$style.container" :style="styles.container">
    <div :class="$style.stamp">
      {{ ':' + state.stamp.name + ': from' }}
    </div>
    <stamp-detail-element-content
      v-for="(stamp, userId) in state.stampByUserId"
      :key="userId"
      :user-id="userId"
      :count="stamp.count"
      :class="$style.content"
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
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import { StampId } from '@/types/entity-ids'
import { MessageStamp } from '@traptitech/traq'
import StampDetailElementContent from './StampDetailElementContent.vue'
import { reduceToRecord } from '@/lib/util/record'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({}))
  })

export default defineComponent({
  name: 'StampDetailListElement',
  components: {
    StampDetailElementContent
  },
  props: {
    stampId: {
      type: String as PropType<StampId>,
      required: true
    },
    stamps: {
      type: Array as PropType<MessageStamp[]>,
      required: true
    }
  },
  setup(props) {
    const styles = useStyles()
    const state = reactive({
      stampByUserId: reduceToRecord(props.stamps, 'userId'),
      stamp: computed(() => store.state.entities.stamps[props.stampId])
    })
    return { styles, state }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
}
.stamp {
}
.content {
}
</style>
