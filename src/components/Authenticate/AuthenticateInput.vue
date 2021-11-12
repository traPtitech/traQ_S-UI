<template>
  <div>
    <label :for="id" :class="$style.title">{{ label }}</label>
    <div :class="$style.container">
      <input
        :id="id"
        :class="$style.input"
        :value="value"
        :type="typeWithShown"
        :autofocus="autofocus"
        :autocomplete="autocomplete"
        :autocapitalize="autocapitalize"
        :enterkeyhint="enterkeyhint"
        @input="(onInput as any /* FIXME: 型がうまくいかない (カッコでくくらないとsyntax highlightが壊れる) */)"
      />
      <button
        v-if="type === 'password'"
        type="button"
        :title="`パスワードを${isPasswordShown ? '非表示' : '表示'}`"
        :class="$style.toggle"
        @click.prevent="togglePassword"
      >
        <a-icon
          :name="isPasswordShown ? 'eye-off-outline' : 'eye-outline'"
          mdi
          :class="$style.toggleIcon"
        />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { randomString } from '/@/lib/basic/randomString'
import AIcon from '/@/components/UI/AIcon.vue'
import useShowPassword from '/@/use/showPassword'
import useTextModelSyncer from '/@/use/textModelSyncer'

export default defineComponent({
  name: 'AuthenticateInput',
  components: { AIcon },
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    type: {
      type: String as PropType<'text' | 'password'>,
      default: 'text' as const
    },
    autocomplete: {
      type: String,
      default: undefined
    },
    autofocus: {
      type: Boolean,
      default: false
    },
    autocapitalize: {
      type: String,
      default: 'off'
    },
    enterkeyhint: {
      type: String,
      default: undefined
    }
  },
  setup(props, { emit }) {
    const { value, onInput } = useTextModelSyncer(props, emit)

    const id = randomString()

    const { isPasswordShown, togglePassword, typeWithShown } =
      useShowPassword(props)

    return {
      value,
      onInput,
      id,
      isPasswordShown,
      togglePassword,
      typeWithShown
    }
  }
})
</script>

<style lang="scss" module>
.title {
  @include color-ui-secondary;
  margin-bottom: 16px;
  font: {
    size: 1rem;
    weight: bold;
  }
}
.container {
  @include background-secondary;
  display: flex;
  border-radius: 4px;
}
.input {
  @include color-text-primary;
  width: 100%;
  height: 2rem;
  padding: 0.5rem;
}
.toggle {
  @include color-ui-secondary;
  height: 100%;
  padding: 0.25rem;
  padding-left: 0;
  cursor: pointer;
}
.toggleIcon {
  vertical-align: middle;
}
</style>
