<template>
  <div :class="$style.container" title="ファイルを添付する">
    <icon
      :class="$style.button"
      mdi
      name="plus-circle-outline"
      @click="onClick"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, SetupContext } from '@vue/composition-api'
import Icon from '@/components/UI/Icon.vue'

const useClickHandlers = (context: SetupContext) => {
  const onClick = () => {
    context.emit('click')
  }
  return { onClick }
}

export default defineComponent({
  name: 'MessageInputUploadButton',
  components: {
    Icon
  },
  setup(_, context: SetupContext) {
    const { onClick } = useClickHandlers(context)
    return {
      context,
      onClick
    }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  display: flex;
}
.button {
  cursor: pointer;
}
</style>
