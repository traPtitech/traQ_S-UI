<template>
  <button @click="context.emit('click')" :class="$style.container">
    <icon mdi name="close" :size="12" :class="$style.icon" />
    <div role="presentation" :class="$style.bg"></div>
  </button>
</template>

<script lang="ts">
import { defineComponent, SetupContext } from '@vue/composition-api'
import Icon from '@/components/UI/Icon.vue'

export default defineComponent({
  name: 'MessageInputFileListItem',
  components: {
    Icon
  },
  setup(_, context: SetupContext) {
    return { context }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: $theme-background-primary;
  cursor: pointer;
}
.icon {
  z-index: 1;
}
.bg {
  position: absolute;
  background: $theme-ui-primary;
  opacity: 0.5;
  .container:hover & {
    opacity: 0.8;
  }
  width: 100%;
  height: 100%;
  border-radius: 16px;
}
</style>
