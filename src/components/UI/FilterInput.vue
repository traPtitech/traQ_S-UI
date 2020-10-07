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
      :value="text"
      :placeholder="placeholder"
      :autocapitalize="autocapitalize"
      :inputmode="disableIme ? 'url' : undefined"
      :data-disable-ime="$boolAttr(disableIme)"
      :enterkeyhint="enterkeyhint"
      @input="onInput"
      type="text"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, shallowRef, onMounted } from 'vue'
import Icon from '@/components/UI/Icon.vue'
import useInput from '@/use/input'
import { isTouchDevice } from '@/lib/util/browser'

export default defineComponent({
  name: 'FilterInput',
  components: {
    Icon
  },
  props: {
    text: {
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
  setup(props, context) {
    const { onInput } = useInput(context)

    const inputRef = shallowRef<HTMLInputElement | null>(null)
    onMounted(() => {
      if (!props.focusOnMount || isTouchDevice()) return
      inputRef.value?.focus()
    })
    const focus = () => {
      inputRef.value?.focus()
    }

    return { focus, inputRef, onInput }
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
  margin: 0 8px;
  flex-shrink: 0;
}
.input {
  @include color-ui-primary;
  margin: 0 8px;
  width: 100%;
  &[data-disable-ime] {
    ime-mode: disabled;
  }
}
</style>
