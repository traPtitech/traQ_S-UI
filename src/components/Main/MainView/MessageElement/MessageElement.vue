<template>
  <div :class="$style.body">
    <div v-html="state.content" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import store from '@/store'

interface Props {
  messageId: string
}

export default defineComponent({
  name: 'MessageElement',
  props: {
    messageId: {
      type: String,
      required: true
    }
  },
  setup(props: Props) {
    const state = reactive({
      message: computed(() => store.state.entities.messages[props.messageId]),
      content: computed(
        () =>
          store.state.domain.messagesView.renderedContentMap[props.messageId] ??
          ''
      )
    })

    return { state }
  }
})
</script>

<style lang="scss" module>
.body {
  padding: 8px 0;
}
</style>
