<template>
  <div :class="$style.container" :style="styles.container">
    <toggle @input="onInput" :enabled="enabled" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import { UserId } from '@/types/entity-ids'
import useToggle from '@/use/toggle'
import Toggle from '@/components/UI/Toggle.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({}))
  })

export default defineComponent({
  name: 'UserNotificationListItem',
  components: {
    Toggle
  },
  props: {
    userId: {
      type: String as PropType<UserId>,
      required: true
    }
  },
  setup(props) {
    const styles = useStyles()
    const { enabled, onInput } = useToggle(true)
    return { styles, enabled, onInput }
  }
})
</script>

<style lang="scss" module>
.container {
}
</style>
