<template>
  <router-link
    :to="constructMessagesPath(messageId)"
    :replace="messageQuery === messageId"
  >
    <slot />
  </router-link>
</template>

<script lang="ts" setup>
import { useMessageQuery } from '/@/composables/utils/useMessageQuery'
import { constructMessagesPath } from '/@/router'

const messageQuery = useMessageQuery()

const { messageId } = defineProps<{
  messageId: string
}>()
</script>
