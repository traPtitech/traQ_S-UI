<template>
  <section data-testid="usermodal-bio">
    <profile-header text="ひとこと" />
    <span
      :class="$style.bio"
      :aria-busy="isLoading"
      :data-is-empty="$boolAttr(isEmpty)"
    >
      <inline-markdown :content="content" accept-action />
    </span>
  </section>
</template>

<script lang="ts" setup>
import ProfileHeader from './ProfileHeader.vue'
import InlineMarkdown from '/@/components/UI/InlineMarkdown.vue'
import { computed } from 'vue'

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
  return props.bio
})
</script>

<style lang="scss" module>
.bio {
  @include color-ui-primary;
  white-space: pre-line;
  &[aria-busy='true'],
  &[data-is-empty] {
    @include color-ui-tertiary;
  }
}
</style>
