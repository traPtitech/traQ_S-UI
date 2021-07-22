<template>
  <div :class="$style.header">
    <span :class="$style.displayName">{{ state.displayName }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, PropType } from 'vue'
import { UserId } from '/@/types/entity-ids'
import store from '/@/store'

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
      user: computed(() => store.state.entities.usersMap.get(props.userId)),
      displayName: computed((): string => state.user?.displayName ?? 'unknown')
    })
    if (state.user === undefined) {
      store.dispatch.entities.fetchUser({ userId: props.userId })
    }

    return { state }
  }
})
</script>

<style lang="scss" module>
.header {
  display: inline-flex;
  align-items: center;
  min-width: 0;
}

.displayName {
  @include size-body2;
  font-weight: bold;
  word-break: keep-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
