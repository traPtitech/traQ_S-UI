<template>
  <div>
    <label v-if="label" :for="id" :class="$style.label">
      {{ label }}
    </label>
    <div
      :class="$style.inputContainer"
      :data-on-secondary="$boolAttr(onSecondary)"
    >
      <select :id="id" v-model="value" :class="$style.select">
        <option
          v-for="option in options"
          :key="option.value ?? nullSymbol"
          :value="option.value"
          :disabled="option.value === null"
        >
          {{ option.key }}
        </option>
      </select>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { randomString } from '/@/lib/util/randomString'
import { useModelValueSyncer } from '/@/use/modelSyncer'

const nullSymbol = Symbol('null')

export default defineComponent({
  name: 'FormSelector',
  props: {
    modelValue: {
      // nullableのとき https://github.com/vuejs/vue-next/issues/3948
      type: null as unknown as PropType<string | null>,
      default: ''
    },
    onSecondary: {
      type: Boolean,
      default: false
    },
    /**
     * valueがnullのものはdisabled
     */
    options: {
      type: Array as PropType<Array<{ key: string; value: string | null }>>,
      required: true
    },
    label: {
      type: String,
      default: undefined
    }
  },
  emits: {
    'update:modelValue': (_val: string | null) => true
  },
  setup(props, { emit }) {
    const value = useModelValueSyncer(props, emit)
    const id = randomString()
    return { value, id, nullSymbol }
  }
})
</script>

<style lang="scss" module>
.label {
  @include color-ui-secondary;
  margin-bottom: 8px;
  display: block;
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
.select {
  margin: 0 8px;
  width: 100%;
  color: inherit;
  background: inherit;
}
</style>
