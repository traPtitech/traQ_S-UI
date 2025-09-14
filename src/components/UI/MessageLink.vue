<template>
  <router-link
    :to="constructMessagesPath(messageId)"
    :replace="messageQuery === messageId"
  >
    <slot />
  </router-link>
</template>

<script lang="ts" setup>
import { constructMessagesPath } from '/@/router'
import { useMessageQuery } from '/@/composables/utils/useMessageQuery'

const messageQuery = useMessageQuery()

const { messageId } = defineProps<{
  messageId: string
}>()
</script>
