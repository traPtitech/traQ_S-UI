<template>
  <div>
    <label v-if="label" :for="id" :class="$style.label">
      {{ label }}
    </label>
    <div
      :class="$style.inputContainer"
      :data-on-secondary="$boolAttr(onSecondary)"
    >
      <span v-if="prefix" :class="$style.prefix" @click="focus">
        {{ prefix }}
      </span>
      <input
        ref="inputRef"
        :class="$style.input"
        :id="id"
        :type="typeWithShown"
        :value="modelValue"
        :name="name"
        :autocomplete="autocomplete"
        :placeholder="placeholder"
        :max="max"
        :min="min"
        :step="step"
        @input="onInput"
        @change="onChange"
      />
      <span v-if="suffix" :class="$style.suffix" @click="focus">
        {{ suffix }}
      </span>
      <length-count
        :class="$style.count"
        :value="modelValue"
        :max-length="maxLength"
      />
      <button
        v-if="type === 'password'"
        :title="`パスワードを${isPasswordShown ? '非表示' : '表示'}`"
        :class="$style.toggle"
        @click.prevent="togglePassword"
      >
        <icon
          :name="isPasswordShown ? 'eye-off-outline' : 'eye-outline'"
          mdi
          :class="$style.toggleIcon"
        />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, shallowRef } from 'vue'
import { randomString } from '@/lib/util/randomString'
import useInput from '@/use/input'
import Icon from '@/components/UI/Icon.vue'
import useShowPassword from '@/use/showPassword'
import LengthCount from '@/components/UI/LengthCount.vue'

export default defineComponent({
  name: 'FormInput',
  components: {
    Icon,
    LengthCount
  },
  props: {
    type: {
      type: String,
      default: 'text'
    },
    modelValue: {
      type: [String, Number],
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
    name: String,
    autocomplete: String,
    label: String,
    prefix: String,
    suffix: String,
    min: String,
    max: String,
    step: String,
    maxLength: Number,
    useChangeEvent: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const { onInput: onInputInternal } = useInput(context, 'update:modelValue')

    const onInput = (e: InputEvent) => {
      if (props.useChangeEvent) return
      onInputInternal(e)
    }
    const onChange = (e: InputEvent) => {
      if (!props.useChangeEvent) return
      onInputInternal(e)
    }

    const inputRef = shallowRef<HTMLInputElement | null>(null)
    const focus = () => {
      inputRef.value?.focus()
    }

    const id = randomString()

    const { isPasswordShown, togglePassword, typeWithShown } = useShowPassword(
      props
    )

    return {
      onInput,
      onChange,
      id,
      inputRef,
      focus,
      isPasswordShown,
      togglePassword,
      typeWithShown
    }
  }
})
</script>

<style lang="scss" module>
.label {
  @include color-ui-secondary;
  display: block;
  margin-bottom: 8px;
}
.inputContainer {
  @include color-ui-primary;
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
.prefix {
  margin-left: 8px;
}
.input {
  margin: 0 8px;
  width: 100%;
  color: inherit;
}
.suffix {
  margin-right: 8px;
}
.count {
  margin-right: 4px;
}
.toggle {
  @include color-ui-primary;
  height: 100%;
  margin-right: 4px;
  cursor: pointer;
}
.toggleIcon {
  vertical-align: middle;
}
</style>
