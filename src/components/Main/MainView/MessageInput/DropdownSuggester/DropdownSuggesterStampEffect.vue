<template>
  <inline-markdown v-if="isShown && content" :content="content" />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import store from '/@/store'
import InlineMarkdown from '/@/components/UI/InlineMarkdown.vue'

export default defineComponent({
  name: 'DropdownSuggesterStampEffect',
  components: {
    InlineMarkdown
  },
  props: {
    effectNameWithDot: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const stampName = computed(() => {
      const initialStamps = store.getters.entities.initialRecentStamps.map(
        stamp => stamp.name
      )
      return initialStamps[0]
    })
    const content = computed(() =>
      stampName.value
        ? `:${stampName.value}${props.effectNameWithDot}:`
        : undefined
    )
    const isShown = computed(
      () =>
        // largeとex-largeは表示できないので何も表示しない
        !['.large', '.ex-large'].includes(props.effectNameWithDot)
    )

    return { isShown, content }
  }
})
</script>
