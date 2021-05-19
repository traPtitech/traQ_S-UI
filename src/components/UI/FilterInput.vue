<template>
  <div
    :class="$style.container"
    :data-on-secondary="$boolAttr(onSecondary)"
    @click="focus"
  >
    <icon mdi name="search" :size="18" :class="$style.icon" />
    <input
      ref="inputRef"
      :class="$style.input"
      :value="value"
      :placeholder="placeholder"
      :autocapitalize="autocapitalize"
      :inputmode="disableIme ? 'url' : undefined"
      :data-disable-ime="$boolAttr(disableIme)"
      :enterkeyhint="enterkeyhint"
      type="text"
      @input="onInput"
      @keydown.esc="reset"
      @keydown.enter="$emit('enter')"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, shallowRef, onMounted } from 'vue'
import Icon from '@/components/UI/Icon.vue'
import { isTouchDevice } from '@/lib/util/browser'
import useTextModelSyncer from '@/use/textModelSyncer'

export default defineComponent({
  name: 'FilterInput',
  components: {
    Icon
  },
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    onSecondary: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: ''
    },
    autocapitalize: {
      type: String,
      default: 'off'
    },
    disableIme: {
      type: Boolean,
      default: false
    },
    focusOnMount: {
      type: Boolean,
      default: false
    },
    enterkeyhint: {
      type: String,
      default: 'search'
    }
  },
  setup(props, { emit }) {
    const { value, onInput } = useTextModelSyncer(props, emit)

    const reset = () => {
      // update:modelValueイベントを発火することで値を変更する
      emit('update:modelValue', '')
    }

    const inputRef = shallowRef<HTMLInputElement | null>(null)
    onMounted(() => {
      if (!props.focusOnMount || isTouchDevice()) return
      inputRef.value?.focus()
    })
    const focus = () => {
      inputRef.value?.focus()
    }

    return { value, onInput, focus, inputRef, reset }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  @include background-secondary;
  @include size-body1;
  height: 30px;
  display: flex;
  align-items: center;
  padding: 0 8px;
  border-radius: 4px;
  &[data-on-secondary] {
    @include background-primary;
  }

  border: solid 2px transparent;
  &:focus-within {
    border-color: $theme-accent-focus;
  }
}
.icon {
  margin-right: 8px;
  flex-shrink: 0;
}
.input {
  @include color-ui-primary;
  width: 100%;
  &[data-disable-ime] {
    ime-mode: disabled;
  }
}
</style>
