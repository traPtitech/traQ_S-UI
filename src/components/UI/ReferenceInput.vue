<template>
  <GenericReferenceInput
    ref="input"
    v-model="model"
    :adapter="adapter"
    :single-line="mode === 'search'"
    :role="mode === 'search' ? 'combobox' : 'textbox'"
    :placeholder="placeholder"
    :dir="dir"
    :labelled-by="labelledBy"
    :readonly="readonly"
    :markdown="markdown"
    :prepare-paste="preparePaste"
    :document-key="documentKey"
    :test-id="testId"
    :class="$style.theme"
    @keydown="emit('keydown', $event)"
    @keyup="emit('keyup', $event)"
    @before-input="emit('beforeInput', $event)"
    @focus="emit('focus')"
    @blur="emit('blur')"
    @layout-change="emit('layoutChange')"
  >
    <template #suggestions="{ popupId }">
      <slot name="suggestions" :suggestions="suggestions" :popup-id="popupId">
        <DropdownSuggester
          v-if="suggestions"
          :popup-id="popupId"
          :is-shown="
            suggestions.shown.value && suggestions.candidates.value.length > 0
          "
          :width="380"
          :position="suggestions.position.value"
          :placement="mode === 'search' ? 'below' : 'above'"
          :teleport="mode !== 'search'"
          :candidates="suggestions.candidates.value"
          :shortcuts="suggestions.shortcuts.value"
          :show-keyboard-hints="keyboardRecentlyUsed"
          :selected-index="suggestions.selectedIndex.value"
          @select="suggestions.confirmCandidate"
          @continue-path="suggestions.continuePath"
          @append-effect="suggestions.appendEffect"
        />
      </slot>
    </template>
  </GenericReferenceInput>
</template>
<script setup lang="ts">
import { computed, proxyRefs, ref } from 'vue'

import {
  ReferenceInput as GenericReferenceInput,
  type ReferenceInputHandle
} from '@traq-flavored-markdown/vue-editor'
import type { PreparePaste } from '@traq-flavored-markdown/vue-editor'
import '@traq-flavored-markdown/vue-editor/style.css'

import DropdownSuggester from '/@/components/UI/DropdownSuggester/DropdownSuggester.vue'
import useRecentKeyboardInput from '/@/composables/dom/useRecentKeyboardInput'
import { useTraqInputAdapter } from '/@/composables/referenceInput/useTraqInputAdapter'
import useTraqReferenceInput from '/@/composables/referenceInput/useTraqReferenceInput'
import type { ReferenceInputAdapter } from '/@/lib/referenceInput/adapter'
import type { InputMode } from '/@/lib/references'

const model = defineModel<string>({ default: '' })
const props = withDefaults(
  defineProps<{
    /** Fixed during this mount. */
    mode?: InputMode
    dir?: 'auto' | 'ltr' | 'rtl'
    adapter?: ReferenceInputAdapter
    placeholder?: string
    labelledBy?: string
    readonly?: boolean
    markdown?: boolean
    preparePaste?: PreparePaste
    documentKey?: string | number
    testId?: string
  }>(),
  { mode: 'message', placeholder: '', readonly: false, markdown: false }
)
const emit = defineEmits<{
  keydown: [event: KeyboardEvent]
  keyup: [event: KeyboardEvent]
  beforeInput: [event: InputEvent]
  focus: []
  blur: []
  layoutChange: []
}>()
const { adapter, suggestions } = useTraqInputAdapter(
  props.adapter ?? useTraqReferenceInput(),
  props.mode
)
const keyboardRecentlyUsed = useRecentKeyboardInput()
const input = ref<ReferenceInputHandle>()
defineExpose(
  proxyRefs({
    focus: (position?: 'end') => input.value?.focus(position),
    insertText: (...args: Parameters<ReferenceInputHandle['insertText']>) =>
      input.value?.insertText(...args),
    insertLineBreak: (
      ...args: Parameters<ReferenceInputHandle['insertLineBreak']>
    ) => input.value?.insertLineBreak(...args),
    element: computed(() => input.value?.element)
  }) satisfies ReferenceInputHandle
)
</script>
<style lang="scss" module>
.theme {
  --reference-input-text: #{$theme-text-primary-default};
  --reference-input-accent: #{$theme-accent-primary-default};
  --reference-input-reference-background: #{$theme-background-secondary-default};
  --reference-input-focus: #{$theme-accent-focus-default};
  --reference-input-muted: #{$theme-ui-secondary-default};
  --reference-input-border: #{$theme-background-secondary-border};
  --reference-input-spoiler-background: color-mix(
    in srgb,
    #{$theme-text-primary-default} 10%,
    transparent
  );
}
</style>
