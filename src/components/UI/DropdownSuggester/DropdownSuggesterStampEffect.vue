<template>
  <MarkdownPreview v-if="isShown && content" :content="content" inline />
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import MarkdownPreview from '/@/components/UI/MarkdownPreview.vue'

const props = defineProps<{
  effectNameWithDot: string
  content?: string
}>()

const isShown = computed(
  () =>
    // largeとex-largeは表示できないので何も表示しない
    !['.large', '.ex-large'].includes(props.effectNameWithDot)
)
</script>
