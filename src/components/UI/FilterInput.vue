<template>
  <div
    :class="$style.container"
    :data-on-secondary="onSecondary"
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
      :data-disable-ime="disableIme"
      @input="onInput"
      type="text"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from '@vue/composition-api'
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
    }
  },
  setup(props, context) {
    const { onInput } = useInput(context)

    const inputRef = ref<HTMLInputElement>(null)
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
