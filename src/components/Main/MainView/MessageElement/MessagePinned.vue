<template>
  <div :class="$style.container">
    <a-icon name="pin" mdi :size="16" :class="$style.pin" />
    {{ userDisplayName }}さんがピン留めしました
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import store from '/@/vuex'
import { MessageId } from '/@/types/entity-ids'
import AIcon from '/@/components/UI/AIcon.vue'
import { useMessagesView } from '/@/store/domain/messagesView'

export default defineComponent({
  name: 'MessagePinned',
  components: {
    AIcon
  },
  props: {
    messageId: {
      type: String as PropType<MessageId>,
      required: true
    }
  },
  setup(props) {
    const { pinnedMessages } = useMessagesView()
    const userDisplayName = computed(() => {
      const pin = pinnedMessages.value.find(
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
