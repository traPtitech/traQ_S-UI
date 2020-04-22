<template>
  <div :class="$style.container" :style="styles.container">
    {{ user.name + '(' }}
    <spin-number :value="props.count" />
    {{ ')' }}
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
import { UserId } from '@/types/entity-ids'
import SpinNumber from '@/components/UI/SpinNumber.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({}))
  })

export default defineComponent({
  name: 'StampDetailListElementContent',
  components: {
    SpinNumber
  },
  props: {
    userId: {
      type: String as PropType<UserId>,
      required: true
    },
    count: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const styles = useStyles()
    const user = computed(() => store.state.entities.users[props.userId])
    return { styles, user, props }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  margin: 0 4px;
}
</style>
