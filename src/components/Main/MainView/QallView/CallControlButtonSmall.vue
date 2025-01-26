<script setup lang="ts">
import { defineProps, useCssModule, computed } from 'vue'
import AIcon from '/@/components/UI/AIcon.vue'

const props = defineProps({
  icon: {
    type: String,
    default: ''
  },
  onClick: {
    type: Function,
    default: null
  },
  mdi: {
    type: Boolean,
    default: false
  },
  inverted: {
    type: Boolean,
    default: false
  }
})

const style = useCssModule()

const iconClass = computed(() => ({
  [style.icon]: true,
  [style.inverted]: props.inverted
}))

function handleClick() {
  props.onClick?.()
}
</script>

<template>
  <button :class="style.callControlBtnSmall" @click="handleClick">
    <AIcon v-if="icon" :name="icon" :mdi="mdi" :size="32" :class="iconClass" />
  </button>
</template>

<style lang="scss" module>
.callControlBtnSmall {
  width: 48px;
  height: 48px;
  border: none;
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  transition: opacity 0.3s;
  @include background-tertiary;
  @include color-ui-primary;
}

.callControlBtnSmall:hover {
  opacity: 0.5;
}

.icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.inverted {
  filter: invert(1);
}
</style>
