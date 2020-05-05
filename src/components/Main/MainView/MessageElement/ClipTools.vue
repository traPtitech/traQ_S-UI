<template>
  <div :class="$style.container" :style="styles.container">
    <icon :size="20" mdi name="dots-horizontal" @click="onDotsClick" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'
import { MessageId } from '@/types/entity-ids'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.primary,
      color: theme.ui.tertiary
    }))
  })

export default defineComponent({
  name: 'MessageTools',
  components: {
    Icon
  },
  props: { messageId: { type: String as PropType<MessageId>, required: true } },
  setup(props) {
    const styles = useStyles()
    const onDotsClick = (e: MouseEvent) => {
      store.dispatch.ui.messageContextMenu.openMessageContextMenu({
        messageId: props.messageId,
        x: e.pageX,
        y: e.pageY
      })
    }

    return {
      styles,
      onDotsClick
    }
  }
})
</script>

<style lang="scss" module>
.container {
  border-radius: 4px;
  border: solid 2px;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 3px 0;
  padding: 4px;
  justify-content: space-between;
}
</style>
