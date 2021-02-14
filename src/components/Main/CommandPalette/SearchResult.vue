<template>
  <div v-if="resultMessages.length > 0" :class="$style.container">
    <div v-for="message in resultMessages" :key="message.id">
      <search-result-message-element
        :message="message"
        :class="$style.element"
      />
    </div>
  </div>
  <div v-else :class="$style.container"></div>
</template>

<script lang="ts">
import { defineComponent, ref, watchEffect } from 'vue'
import { Message } from '@traptitech/traq'
import SearchResultMessageElement from './SearchResultMessageElement.vue'
import { useCommandPaletteStore } from '@/providers/commandPalette'
import useSearchMessages from './use/searchMessages'

export default defineComponent({
  components: { SearchResultMessageElement },
  name: 'SearchResult',
  setup() {
    const { commandPaletteStore: store } = useCommandPaletteStore()
    const resultMessages = ref<Message[]>([])
    const { fetchMessagesBySearch } = useSearchMessages()
    watchEffect(async () => {
      const res = await fetchMessagesBySearch(store.query)
      resultMessages.value = res.hits
    })
    return { resultMessages }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-tertiary;
  padding: 32px 16px;
  overflow-y: scroll;
}
.element {
  margin-bottom: 32px;
}
</style>
