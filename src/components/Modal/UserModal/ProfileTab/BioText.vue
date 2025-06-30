<template>
  <section data-testid="usermodal-bio">
    <profile-header text="ひとこと" />
    <markdown-content
      :class="$style.bio"
      :aria-busy="isLoading"
      :data-is-empty="$boolAttr(isEmpty)"
      :content="previewRendered"
    />
  </section>
</template>

<script lang="ts" setup>
import ProfileHeader from './ProfileHeader.vue'
import MarkdownContent from '/@/components/UI/MarkdownContent.vue'
import { computed, ref, watchEffect } from 'vue'
import { render } from '/@/lib/markdown/markdown'

const props = defineProps<{
  bio?: string
}>()

const isLoading = computed(() => props.bio === undefined)
const isEmpty = computed(() =>
  props.bio === undefined ? false : props.bio === ''
)

const content = computed(() => {
  if (isLoading.value) return '[Now loading...]'
  if (isEmpty.value) return '[No bio]'
  return props.bio ?? ''
})

const previewRendered = ref('')
watchEffect(async () => {
  const { renderedText } = await render(content.value)
  previewRendered.value = renderedText
})
</script>

<style lang="scss" module>
.bio {
  @include color-ui-primary;
  &[aria-busy='true'],
  &[data-is-empty] {
    @include color-ui-tertiary;
  }
}
</style>
