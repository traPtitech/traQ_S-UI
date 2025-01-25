<script setup lang="ts">
import { defineProps, useCssModule, computed } from 'vue'
import AIcon from '/@/components/UI/AIcon.vue'

const props = defineProps({
  onClick: {
    type: Function,
    required: true
  },
  inverted: {
    type: Boolean,
    default: false
  }
})

const style = useCssModule()

function handleClick() {
  props.onClick?.()
}

const iconClass = computed(() => ({
  [style.inverted]: props.inverted
}))

const buttonClass = computed(() => ({
  [style.detailButton]: true,
  [style.invertedBackground]: props.inverted,
  [style.normalBackground]: !props.inverted
}))
</script>

<template>
  <button :class="buttonClass" @click="handleClick">
    <AIcon name="plus-circle" mdi :class="iconClass" :size="24" />
  </button>
</template>

<style lang="scss" module>
.detailButton {
  position: absolute;
  bottom: -6px;
  right: -6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 32px;
  height: 32px;
}

.inverted {
  filter: invert(1);
}

.invertedBackground {
  background-color: white;
  width: 24px;
  height: 24px;
}

.normalBackground {
  background-color: black;
  width: 24px;
  height: 24px;
}
</style>
