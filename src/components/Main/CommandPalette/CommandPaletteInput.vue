<template>
  <div :class="$style.container">
    <div :class="$style.icon">
      <icon v-if="store.mode === 'search'" mdi name="search" />
      <icon v-else-if="store.mode === 'command'" mdi name="code-grater-than" />
    </div>
    <input
      :class="$style.input"
      v-model="currentInput"
      @keydown.enter="onEnter"
      :placeholder="placeholder"
    />
  </div>
</template>

<script lang="ts">
import Icon from '@/components/UI/Icon.vue'
import { useCommandPaletteStore } from '@/providers/commandPalette'
import { computed, defineComponent, ref } from 'vue'

export default defineComponent({
  components: { Icon },
  name: 'CommandPaletteInput',
  setup() {
    const { commandPaletteStore: store } = useCommandPaletteStore()

    const currentInput = ref('')

    const onEnter = () => {
      if (store.mode === 'command') {
        // exec command
      }
      if (store.mode === 'search') {
        store.query = currentInput.value
      }
    }

    const placeholder = computed(() => {
      switch (store.mode) {
        case 'command':
          return 'コマンドを入力'
        case 'search':
          return 'メッセージを検索'
        default:
          return undefined
      }
    })

    return { store, currentInput, onEnter, placeholder }
  }
})
</script>

<style lang="scss" module>
.container {
  display: grid;
  grid-template-columns: 24px 1fr;
  align-items: center;
  gap: 16px;
  padding: 0 16px;
  height: 48px;
}
.icon {
  @include color-ui-primary;
  height: 24px;
}
.input {
  @include color-ui-primary;
}
</style>
