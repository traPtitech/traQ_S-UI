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

    return { state }
  }
})
</script>

<style lang="scss" module>
.header {
  display: inline-flex;
  align-items: center;
}

.displayName {
  @include body2-size;
  font-weight: bold;
}
</style>
