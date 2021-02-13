<template>
  <div :class="$style.container">{{ test }}</div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { useCommandPaletteStore } from '@/providers/commandPalette'
import { watch } from 'vue'

export default defineComponent({
  name: 'SearchResult',
  setup() {
    const { commandPaletteStore: store } = useCommandPaletteStore()
    const test = ref('')
    watch(
      computed(() => store.query),
      newValue => {
        test.value = newValue
      }
    )
    return { test }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-tertiary;
  text-align: center;
  padding: 32px 16px;
}
</style>
