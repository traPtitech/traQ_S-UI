<template>
  <div :class="$style.container" :style="styles.container">
    <div :class="$style.day">
      {{ createdDate }}
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  PropType,
  computed
} from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import { MessageId } from '@/types/entity-ids'
import store from '@/store'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'MessagesScrollerDaySeparator',
  props: {
    messageId: {
      type: String as PropType<MessageId>,
      required: true
    }
  },
  setup(props) {
    const styles = useStyles()
    const message = computed(
      () => store.state.entities.messages[props.messageId]
    )
    const createdDate = computed(() => {
      if (
        message.value === undefined ||
        message.value.createdAt === undefined
      ) {
        return ``
      }

      const date = new Date(message.value.createdAt)
      return date.getFullYear() + `/` + date.getMonth() + `/` + date.getDate()
    })
    return { styles, createdDate }
  }
})
</script>

<style lang="scss" module>
.container {
  padding: 4px 12px;
}
.day {
  display: flex;
  align-items: center;
  justify-content: space-between;
  &::before,
  &::after {
    display: block;
    background-color: currentColor;
    height: 1px;
    width: calc(50% - 70px);
    content: ' ';
    opacity: 0.1;
  }
}
</style>
