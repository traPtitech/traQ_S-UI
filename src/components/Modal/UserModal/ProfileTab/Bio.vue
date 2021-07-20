<template>
  <section data-testid="usermodal-bio">
    <profile-header text="ひとこと" :class="$style.header" />
    <inline-markdown
      :class="$style.bio"
      :aria-busy="isLoading"
      :data-is-empty="$boolAttr(isEmpty)"
      :content="content"
      accept-action
    />
  </section>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import ProfileHeader from './ProfileHeader.vue'
import InlineMarkdown from '@/components/UI/InlineMarkdown.vue'

export default defineComponent({
  name: 'Bio',
  components: {
    ProfileHeader,
    InlineMarkdown
  },
  props: {
    bio: String
  },
  setup(props) {
    const isLoading = computed(() => props.bio === undefined)
    const isEmpty = computed(() =>
      props.bio === undefined ? false : props.bio === ''
    )

    const content = computed(() => {
      if (isLoading.value) return '[Now loading...]'
      if (isEmpty.value) return '[No bio]'
      return props.bio
    })

    return { isLoading, isEmpty, content }
  }
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
