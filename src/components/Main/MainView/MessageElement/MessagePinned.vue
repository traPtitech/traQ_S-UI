<template>
  <div :class="$style.container">
    <a-icon name="pin" mdi :size="16" :class="$style.pin" />
    {{ userDisplayName }}さんがピン留めしました
  </div>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'
import { computed } from 'vue'
import { MessageId } from '/@/types/entity-ids'
import { useMessagesView } from '/@/store/domain/messagesView'
import { useUsersStore } from '/@/store/entities/users'

const props = defineProps<{
  messageId: MessageId
}>()

const { usersMap } = useUsersStore()
const { pinnedMessages } = useMessagesView()
const userDisplayName = computed(() => {
  const pin = pinnedMessages.value.find(v => v.message.id === props.messageId)
  const user = usersMap.value.get(pin?.userId ?? '')
  return user?.displayName
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
