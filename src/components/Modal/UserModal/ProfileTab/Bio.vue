<template>
  <section>
    <profile-header text="ひとこと" :class="$style.header" />
    <p
      :class="$style.bio"
      :aria-busy="isLoading"
      :data-is-empty="$boolAttr(isEmpty)"
    >
      <template v-if="isLoading">[Now loading...]</template>
      <template v-else-if="isEmpty">[No bio]</template>
      <template v-else>{{ bio }}</template>
    </p>
  </section>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import ProfileHeader from './ProfileHeader.vue'

export default defineComponent({
  name: 'Bio',
  props: {
    bio: String
  },
  setup(props) {
    const isLoading = computed(() => props.bio === undefined)
    const isEmpty = computed(() =>
      props.bio === undefined ? false : props.bio === ''
    )

    return { isLoading, isEmpty }
  },
  components: {
    ProfileHeader
  }
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
