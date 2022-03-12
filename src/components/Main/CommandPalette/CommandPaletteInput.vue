<template>
  <div :class="$style.container" :data-is-mobile="$boolAttr(isMobile)">
    <div :class="$style.inputContainer">
      <div :class="$style.icon">
        <a-icon v-if="mode === 'search'" mdi name="search" />
        <a-icon v-else-if="mode === 'command'" mdi name="code-grater-than" />
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
import { useCommandPalette } from '/@/store/app/commandPalette'
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

    const { mode, currentInput, settleQuery, closeCommandPalette } =
      useCommandPalette()

    watch(currentInput, () => {
      // 外から入力が変更された場合フォーカスを当てる
      if (document.activeElement !== inputRef.value) {
        inputRef.value?.focus()
      }
    })

    const onEsc = () => {
      currentInput.value = ''
    }

    const onEnter = () => {
      if (mode.value === 'command') {
        // exec command
      }
      if (mode.value === 'search') {
        settleQuery()
      }
    }

    const placeholder = computed(() => {
      switch (mode.value) {
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
      mode,
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
