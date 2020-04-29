<template>
  <message-panel
    @click="onChannelSelect(message.channelId)"
    :message="message"
    :title-type="titleType"
    line-clamp-content
  />
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  PropType,
  computed
} from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import { Message } from '@traptitech/traq'
import useChannelSelect from '@/use/channelSelect'
import MessagePanel from '@/components/UI/MessagePanel/MessagePanel.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.primary
    })),
    path: makeStyles(theme => ({
      color: theme.ui.primary
    })),
    separator: makeStyles(theme => ({
      background: theme.background.secondary
    }))
  })

export default defineComponent({
  name: 'ActivityElement',
  components: {
    MessagePanel
  },
  props: {
    type: {
      type: String as PropType<'channel' | 'message'>,
      required: true
    },
    message: {
      type: Object as PropType<Message>,
      required: true
    }
  },
  setup(props, context) {
    const styles = useStyles()
    const { onChannelSelect } = useChannelSelect()

    const titleType = computed(() =>
      props.type === 'channel' ? 'channel' : 'user'
    )

    return {
      styles,
      onChannelSelect,
      titleType
    }
  }
})
</script>

<style lang="scss" module>
.container {
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
}
.item {
  margin: 4px 0;
}
.separator {
  width: 100%;
  height: 2px;
  margin: 4px 0;
}
</style>
