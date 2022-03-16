<template>
  <inline-markdown v-if="isShown && content" :content="content" />
</template>

<script lang="ts" setup>
import InlineMarkdown from '/@/components/UI/InlineMarkdown.vue'
import { computed } from 'vue'
import { useStampsStore } from '/@/store/entities/stamps'

const props = defineProps<{
  effectNameWithDot: string
}>()

const { initialRecentStamps } = useStampsStore()

const stampName = computed(() => {
  const initialStamps = initialRecentStamps.value.map(stamp => stamp.name)
  return initialStamps[0]
})
const content = computed(() =>
  stampName.value ? `:${stampName.value}${props.effectNameWithDot}:` : undefined
)
const isShown = computed(
  () =>
    // largeとex-largeは表示できないので何も表示しない
    !['.large', '.ex-large'].includes(props.effectNameWithDot)
)
</script>
