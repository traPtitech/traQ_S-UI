<template>
  <div
    :class="$style.container"
    role="switch"
    :aria-checked="modelValue"
    :aria-disabled="disabled"
    @click="toggle"
  >
    <div :class="$style.bg"></div>
    <div :class="$style.knob"></div>
  </div>
</template>

<script lang="ts" setup>


const props = withDefaults(defineProps<{
    modelValue?: boolean,
    disabled?: boolean
}>(), {
    modelValue: false,
    disabled: false
});

const emit = defineEmits<{
    (e: "update:modelValue", _val: boolean): void
}>();

const toggle = () => {
  if (props.disabled) return

  emit('update:modelValue', !props.modelValue)
}
</script>

<style lang="scss" module>
.container {
  position: relative;
  width: 44px;
  height: 24px;
  border-radius: 22px;
  overflow: hidden;
  cursor: pointer;
  &[aria-disabled='true'] {
    cursor: not-allowed;
  }
}
.knob {
  @include background-primary;
  position: absolute;
  top: 4px;
  left: 6px;
  width: 16px;
  height: 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
  .container[aria-checked='true'] & {
    transform: translateX(16px);
  }
}
.bg {
  @include background-tertiary;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: all 0.2s ease;
  .container[aria-checked='true'] & {
    @include background-accent-primary;
  }
  .container[aria-disabled='true'] & {
    opacity: 0.5;
  }
  .container:hover & {
    filter: brightness(0.95);
  }
}
</style>
