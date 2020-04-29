<template>
  <div :class="$style.container" :style="styles.container">
    <icon name="pin" mdi :size="16" :style="styles.pin" :class="$style.pin" />
    {{ username }}さんがピン留めしました
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  PropType,
  computed
} from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import { MessageId } from '@/types/entity-ids'
import Icon from '@/components/UI/Icon.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.text.secondary
    })),
    pin: makeStyles((theme, common) => ({
      color: common.ui.pin
    }))
  })

export default defineComponent({
  name: 'MessagePinned',
  components: {
    Icon
  },
  props: {
    messageId: String as PropType<MessageId>
  },
  setup(props) {
    const styles = useStyles()
    const username = computed(() => {
      const pin = store.state.domain.messagesView.pinnedMessages.find(
        v => v.message.id === props.messageId
      )
      const user = store.state.entities.users[pin?.userId ?? '']
      return user?.name
    })
    return { styles, username }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
}
.pin {
  margin-right: 8px;
}
</style>
