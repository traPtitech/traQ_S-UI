<template>
  <div :class="$style.header">
    <span :class="$style.displayName">{{ state.displayName }}</span>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  computed,
  PropType
} from '@vue/composition-api'
import { UserId } from '@/types/entity-ids'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import apis from '@/lib/api'
import { User } from '@traptitech/traq'

export default defineComponent({
  name: 'MessageQuoteListItemHeader',
  props: {
    userId: {
      type: String as PropType<UserId>,
      required: true
    }
  },
  setup(props) {
    const state = reactive({
      user: computed(() => store.state.entities.users[props.userId]),
      displayName: computed((): string => state.user?.displayName ?? 'unknown')
    })
    if (state.user === undefined) {
      store.dispatch.entities.fetchUser(props.userId)
    }

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
  align-items: center;
}

.displayName {
  font-weight: bold;
  font-size: 0.875rem;
}
</style>
