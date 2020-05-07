<template>
  <div :class="$style.container">
    <icon
      :class="$style.button"
      :size="20"
      mdi
      name="dots-horizontal"
      @click="onDotsClick"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'
import store from '@/store'
import Icon from '@/components/UI/Icon.vue'
import { MessageId } from '@/types/entity-ids'

export default defineComponent({
  name: 'ClipTools',
  components: {
    Icon
  },
  props: { messageId: { type: String as PropType<MessageId>, required: true } },
  setup(props) {
    const onDotsClick = (e: MouseEvent) => {
      store.dispatch.ui.messageContextMenu.openMessageContextMenu({
        messageId: props.messageId,
        x: e.pageX,
        y: e.pageY,
        isMinimum: true
      })
    }

    return { onDotsClick }
  }
})
</script>

<style lang="scss" module>
.container {
  @include background-primary;
  @include color-ui-tertiary;
  border-radius: 4px;
  border: solid 2px;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 3px 0;
  padding: 4px;
  justify-content: space-between;
}

.button {
  cursor: pointer;
}
</style>
