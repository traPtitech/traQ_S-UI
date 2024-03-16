<template>
  <div>
    <!-- <label v-if="label" :for="id" :class="$style.label">
      {{ label }}
    </label>
    <label v-if="activateSearch" :class="$style.search">
      <a-icon name="search" mdi />
      <input v-model="filterText" />
    </label>
    <div
      v-if="filteredOptions.length > 0"
      :class="$style.inputContainer"
      :data-on-secondary="$boolAttr(onSecondary)"
    >
      <select :id="id" v-model="value" :class="$style.select">
        <option
          v-for="option in filteredOptions"
          :key="option.value ?? nullSymbol"
          :value="option.value"
          :disabled="option.value === null"
        >
          {{ option.key }}
        </option>
      </select>
    </div>
    <span v-else :class="$style.errorText"> 候補が見つかりませんでした </span> -->
    <v-autocomplete
      v-model="selected"
      :items="options"
      item-title="key"
      item-value="value"
    ></v-autocomplete>
    {{ selected }}
  </div>
</template>

<script lang="ts" setup>
import { randomString } from '/@/lib/basic/randomString'
import { useModelValueSyncer } from '/@/composables/useModelSyncer'
import { ref, computed } from 'vue'
import AIcon from '/@/components/UI/AIcon.vue'
import { VAutocomplete } from 'vuetify/lib/components/index.mjs'

type Option = { key: string; value: string | null }
const props = withDefaults(
  defineProps<{
    modelValue?: string | null
    onSecondary?: boolean
    options: Array<Option>
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

const filterText = ref('')
const filteredOptions = computed(() =>
  props.options.filter((option: Option) =>
    option.key.includes(filterText.value)
  )
)
const selected = ref<Option | null>(null)
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
.search {
  @include color-ui-primary;
  @include background-secondary;
  @include size-body1;
  height: 30px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  border: solid 2px transparent;
}
.errorText {
  @include color-ui-primary;
  @include background-secondary;
  @include size-body1;
  height: 30px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  border: solid 2px transparent;
}
</style>
