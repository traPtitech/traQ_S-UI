<template>
  <div :class="['markdown-body', $style.content]" v-html="content" />
</template>

<script lang="ts" setup>


defineProps<{
    content: string
}>()
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
