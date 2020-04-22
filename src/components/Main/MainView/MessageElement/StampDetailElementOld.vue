<template>
  <div :class="$style.container" :style="styles.container">
    {{ detail }}
    <!-- あとで消すコンポーネント -->
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import { StampId } from '@/types/entity-ids'
import { MessageStamp } from '@/lib/api'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({}))
  })

const useStampDetail = (props: Props) => {
  const stamp = computed(() => store.state.entities.stamps[props.stampId])
  const state = reactive({
    stamp,
    users: computed(() =>
      props.stamps.map(s => ({
        user: store.state.entities.users[s.userId],
        count: s.count
      }))
    )
  })
  const detail = computed(() => {
    const userStampList = state.users.reduce((acc, cur) => {
      return acc + cur.user?.name + '(' + cur.count + ')'
    }, '')
    return ':' + stamp.value.name + ':' + userStampList
  })

  return { state, detail }
}

type Props = {
  stampId: StampId
  stamps: MessageStamp[]
}

export default defineComponent({
  name: 'StampDetailElement',
  props: {
    stampId: {
      type: String,
      required: true
    },
    stamps: {
      type: Array,
      required: true
    }
  },
  setup(props: Props) {
    const styles = useStyles()
    const { state, detail } = useStampDetail(props)
    return { styles, detail }
  }
})
</script>

<style lang="scss" module>
.container {
}
</style>
