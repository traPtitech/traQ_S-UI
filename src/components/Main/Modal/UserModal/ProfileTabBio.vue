<template>
  <section :class="$style.bio">
    <h2>ひとこと</h2>
    <p>
      <template v-if="props.bio === undefined">Now Loading...</template>
      <template v-else>
        {{ props.bio }}
      </template>
    </p>
  </section>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

interface Props {
  bio?: string
}

export default defineComponent({
  name: 'ProfileTabBio',
  props: {
    bio: String
  },
  setup(props: Props) {
    return {
      props
    }
  }
})
</script>

<style lang="scss" module>
.bio {
}
</style>
