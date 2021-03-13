<template>
  <div :class="$style.container">
    <div :class="$style.icon">
      <icon v-if="store.mode === 'search'" mdi name="search" />
      <icon v-else-if="store.mode === 'command'" mdi name="code-grater-than" />
    </div>
    <input
      :class="$style.input"
      ref="inputRef"
      v-model="store.currentInput"
      @keydown.enter="onEnter"
      :placeholder="placeholder"
    />
  </div>
</template>

<script lang="ts">
import Icon from '@/components/UI/Icon.vue'
import { useCommandPaletteStore } from '@/providers/commandPalette'
import { computed, defineComponent, onMounted, shallowRef, watch } from 'vue'

export default defineComponent({
  components: { Icon },
  name: 'CommandPaletteInput',
  setup() {
    const inputRef = shallowRef<HTMLInputElement | null>(null)
    const focus = () => {
      inputRef.value?.focus()
    }
    onMounted(() => {
      focus()
    })

    const { commandPaletteStore: store, settleQuery } = useCommandPaletteStore()

    watch(
      computed(() => store.currentInput),
      () => {
        // 外から入力が変更された場合フォーカスを当てる
        if (document.activeElement !== inputRef.value) {
          inputRef.value?.focus()
        }
      }
    )

    const onEnter = () => {
      if (store.mode === 'command') {
        // exec command
      }
      if (store.mode === 'search') {
        settleQuery()
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

    return { inputRef, store, onEnter, placeholder }
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
}
.icon {
  @include color-ui-primary;
  height: 24px;
}
.input {
  @include color-ui-primary;
}
</style>
