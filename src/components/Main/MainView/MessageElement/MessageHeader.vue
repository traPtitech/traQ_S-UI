<template>
  <div :class="$style.header">
    <span :class="$style.displayName">{{ state.user.displayName }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from '@vue/composition-api'
import { UserId } from '@/types/entity-ids'
import store from '@/store'
import { makeStyles } from '@/lib/styles'

interface Props {
  userId: UserId
}

export default defineComponent({
  name: 'MessageHeader',
  props: {
    userId: {
      type: String,
      required: true
    }
  },
  setup(props: Props) {
    const state = reactive({
      user: computed(() => store.state.entities.users[props.userId])
    })
    const styles = reactive({
      displayName: makeStyles(theme => {
        return {
          color: theme.ui.tertiary
        }
      })
    })

    return { state, styles }
  }
})
</script>

<style lang="scss" module>
.header {
  display: inline-flex;
  margin-left: 8px;
}

.displayName {
  font-weight: bold;
}
</style>
