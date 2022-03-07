<template>
  <div :class="$style.container" :data-is-mobile="$boolAttr(isMobile)">
    <div :class="$style.inputContainer">
      <div :class="$style.icon">
        <a-icon v-if="store.mode === 'search'" mdi name="search" />
        <a-icon
          v-else-if="store.mode === 'command'"
          mdi
          name="code-grater-than"
        />
      </div>
      <input
        ref="inputRef"
        v-model="currentInput"
        :class="$style.input"
        :placeholder="placeholder"
        @keydown.esc="onEsc"
        @keydown.enter="onEnter"
      />
    </div>
    <close-button
      :class="$style.closeIcon"
      :size="24"
      :inner-size="12"
      @close="closeCommandPalette"
    />
  </div>
</template>

<script lang="ts">
import CloseButton from '/@/components/UI/CloseButton.vue'
import AIcon from '/@/components/UI/AIcon.vue'
import { useCommandPaletteStore } from '/@/providers/commandPalette'
import { computed, defineComponent, onMounted, shallowRef, watch } from 'vue'
import { useResponsiveStore } from '/@/store/ui/responsive'

export default defineComponent({
  name: 'CommandPaletteInput',
  components: { AIcon, CloseButton },
  setup() {
    const { isMobile } = useResponsiveStore()
    const inputRef = shallowRef<HTMLInputElement | null>(null)
    const focus = () => {
      inputRef.value?.focus()
    }
    onMounted(() => {
      focus()
    })

    const {
      commandPaletteStore: store,
      settleQuery,
      closeCommandPalette,
      setCurrentInput
    } = useCommandPaletteStore()

    watch(
      () => store.currentInput,
      () => {
        // 外から入力が変更された場合フォーカスを当てる
        if (document.activeElement !== inputRef.value) {
          inputRef.value?.focus()
        }
      }
    )

    const currentInput = computed({
      get: () => store.currentInput,
      set: input => {
        setCurrentInput(input)
      }
    })

    const onEsc = () => {
      setCurrentInput('')
    }

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

    return {
      isMobile,
      inputRef,
      store,
      currentInput,
      onEsc,
      onEnter,
      placeholder,
      closeCommandPalette
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  min-width: 0;
  align-items: center;
  padding: 0 1rem;
}
.inputContainer {
  display: flex;
  min-width: 0;
  margin: 0.75rem 0;
  flex: 1;
  .container[data-is-mobile] & {
    @include background-secondary;
    padding: 0.25rem 1rem;
    border-radius: 8px;
  }
}
.icon {
  @include color-ui-primary;
  height: 1.5rem;
  margin-right: 1rem;
  .container[data-is-mobile] & {
    @include color-ui-secondary;
  }
}
.closeIcon {
  margin-left: 1.5rem;
  cursor: pointer;
  @include color-ui-primary-inactive;
  &:hover {
    @include color-ui-primary;
  }

  .container[data-is-mobile] & {
    @include color-ui-secondary-inactive;
    &:hover {
      @include color-ui-secondary;
    }
  }
}
.input {
  @include color-ui-primary;
  min-width: 0;
  flex: 1;

  .container:not([data-is-mobile]) & {
    &::placeholder {
      @include color-ui-secondary-inactive;
    }
  }
}
</style>
