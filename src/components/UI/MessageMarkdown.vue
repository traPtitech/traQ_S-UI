<template>
  <div :class="['markdown-body', $style.content]" v-html="content" />
</template>

<script lang="ts" setup>
import { MessageId } from '/@/types/entity-ids'
import { computed } from 'vue';
import { useMessagesView } from '/@/store/domain/messagesView'

const props = defineProps<{
    messageId: MessageId
}>();

const { renderedContentMap } = useMessagesView()
const content = computed(
  () => renderedContentMap.value.get(props.messageId) ?? ''
)
</script>

<style lang="scss" module>
.content {
  grid-area: message-contents;
  word-break: normal;
  overflow-wrap: break-word; // for Safari
  overflow-wrap: anywhere;
  line-break: loose;
}
</style>
