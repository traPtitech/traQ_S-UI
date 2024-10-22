<template>
  <button
    :class="$style.container"
    :disabled="loading || disabled"
    :data-is-loading="$boolAttr(loading)"
    :data-type="type"
    :data-is-danger="$boolAttr(isDanger)"
  >
    <div :class="$style.label">
      <a-icon v-if="icon" :mdi="mdi" :name="icon" />
      {{ label }}
    </div>
    <loading-spinner
      v-if="loading"
      :class="$style.spinner"
      :color="spinnerColor"
    />
  </button>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import LoadingSpinner from '/@/components/UI/LoadingSpinner.vue'
import AIcon from '/@/components/UI/AIcon.vue'
import { match, P } from 'ts-pattern'

interface Type {
  type?: 'primary' | 'secondary' | 'tertiary'
  isDanger?: boolean
}

interface NonDangerType extends Type {
  type?: 'primary' | 'secondary' | 'tertiary'
  isDanger?: false
}
interface DangerType extends Type {
  type?: 'primary' | 'secondary'
  isDanger: true
}

type Props = {
  label?: string
  loading?: boolean
  disabled?: boolean
  icon?: string
  mdi?: boolean
} & (NonDangerType | DangerType)

const {
  label = '',
  loading = false,
  disabled = false,
  type = 'primary',
  isDanger = false,
  mdi = false
} = defineProps<Props>()

const spinnerColor = computed(() => {
  return match([type, isDanger] as const)
    .with(['primary', P._], () => 'white' as const)
    .with(['secondary', true], () => 'accent-error' as const)
    .with(['secondary', false], () => 'accent-primary' as const)
    .with(['tertiary', P._], () => 'ui-secondary' as const)
    .exhaustive()
})
</script>

<style lang="scss" module>
.container {
  position: relative;
  border: solid 2px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  &:disabled:not([data-is-loading]) {
    opacity: 0.5;
    cursor: not-allowed;
  }
  &[data-is-loading] {
    cursor: wait;
  }
  &[data-type='primary'] {
    @include color-common-text-white-primary;
    @include background-accent-primary;
    border-color: $theme-accent-primary-default;
  }
  &[data-type='secondary'] {
    @include color-accent-primary;
    border-color: $theme-accent-primary-default;
  }
  &[data-type='tertiary'] {
    @include color-ui-secondary;
    border-color: $theme-ui-secondary-default;
  }

  &[data-type='primary'][data-is-danger] {
    @include color-common-text-white-primary;
    @include background-accent-error;
    border-color: $theme-accent-error-default;
  }
  &[data-type='secondary'][data-is-danger] {
    color: $theme-accent-error-default;
    border-color: $theme-accent-error-default;
  }
}
.label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 32px;
  .container[data-is-loading] & {
    visibility: hidden;
  }
}

.spinner {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
</style>
