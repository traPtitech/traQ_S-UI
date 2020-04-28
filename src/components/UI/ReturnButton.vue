<template>
  <icon
    :size="size"
    mdi
    name="chevron-left"
    :class="$style.button"
    @click="onClick"
  />
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import Icon from '@/components/UI/Icon.vue'

export default defineComponent({
  name: 'ReturnButton',
  components: {
    Icon
  },
  props: {
    size: {
      type: Number,
      default: 24
    }
  },
  setup(_, context) {
    const onClick = () => {
      context.emit('click')
    }
    return { onClick }
  }
})
</script>

<style lang="scss" module>
.button {
  cursor: pointer;
}
</style>
