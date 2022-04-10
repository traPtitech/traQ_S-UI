<template>
  <span class="markdown-body" :class="$style.content" v-html="content" />
</template>

<script lang="ts" setup>
defineProps<{
  content: string
}>()
</script>

<style lang="scss" module>
.content {
  word-break: normal;
  overflow-wrap: break-word; // for Safari
  overflow-wrap: anywhere;
  line-break: loose;
}
</style>
