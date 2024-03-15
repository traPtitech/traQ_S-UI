<template>
  <div>
    <label v-if="label" :for="id" :class="$style.label">
      {{ label }}
    </label>
    <label v-if="activateSearch">
      <a-icon name="search" mdi />
      <input v-model="searchText" />
    </label>
    <div
      :class="$style.inputContainer"
      :data-on-secondary="$boolAttr(onSecondary)"
    >
      <select :id="id" v-model="value" :class="$style.select">
        <template v-for="option in options" :key="option.value ?? nullSymbol">
          <option
            v-if="option.key.match(searchText)"
            :value="option.value"
            :disabled="option.value === null"
          >
            {{ option.key }}
          </option>
        </template>
      </select>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { randomString } from '/@/lib/basic/randomString'
import { useModelValueSyncer } from '/@/composables/useModelSyncer'
import { ref } from 'vue'
import AIcon from '/@/components/UI/AIcon.vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string | null
    onSecondary?: boolean
    options: Array<{ key: string; value: string | null }>
    label?: string
    activateSearch?: boolean
  }>(),
  {
    modelValue: '',
    onSecondary: false,
    activateSearch: false
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', _val: string | null): void
}>()

const nullSymbol = Symbol('null')

const value = useModelValueSyncer(props, emit)
const id = randomString()

const searchText = ref('')
</script>

<style lang="scss" module>
.label {
  @include color-ui-primary;
  margin-bottom: 4px;
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
    border-color: $theme-accent-focus-default;
  }
}
.select {
  margin: 0 8px;
  width: 100%;
  color: inherit;
  background: inherit;
}
</style>
