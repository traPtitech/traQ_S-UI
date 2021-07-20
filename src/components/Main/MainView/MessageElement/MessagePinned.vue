<template>
  <div :class="$style.container">
    <icon name="pin" mdi :size="16" :class="$style.pin" />
    {{ userDisplayName }}さんがピン留めしました
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import store from '/@/store'
import { MessageId } from '/@/types/entity-ids'
import Icon from '/@/components/UI/Icon.vue'

export default defineComponent({
  name: 'MessagePinned',
  components: {
    Icon
  },
  props: {
    messageId: String as PropType<MessageId>
  },
  setup(props) {
    const userDisplayName = computed(() => {
      const pin = store.state.domain.messagesView.pinnedMessages.find(
        v => v.message.id === props.messageId
      )
      const user = store.state.entities.usersMap.get(pin?.userId ?? '')
      return user?.displayName
    })
    return { userDisplayName }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-text-secondary;
  display: flex;
  align-items: center;
}
.pin {
  color: $common-ui-pin;
  margin-right: 8px;
  flex-shrink: 0;
}
</style>
