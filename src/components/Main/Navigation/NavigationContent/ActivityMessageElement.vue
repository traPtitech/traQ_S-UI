<template>
  <div
    :class="$style.container"
    :style="styles.container"
    @click="onChannelSelect(state.channelId)"
  >
    <activity-element-user-name
      is-title
      :user="state.user"
      :class="$style.item"
    />
    <div :class="$style.separator" :style="styles.separator"></div>
    <activity-element-channel-name :path="path" :class="$style.item" />
    <activity-element-content :content="message.content" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import { Message } from '@traptitech/traq'
import useChannelSelect from '@/use/channelSelect'
import useActiviyElement from './use/activityElement'
import ActivityElementUserName from './ActivityElementUserName.vue'
import ActivityElementChannelName from './ActivityElementChannelName.vue'
import ActivityElementContent from './ActivityElementContent.vue'

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
    ActivityElementUserName,
    ActivityElementChannelName,
    ActivityElementContent
  },
  props: {
    message: {
      type: Object as PropType<Message>,
      required: true
    }
  },
  setup(props, context) {
    const { activityElementState: state, path } = useActiviyElement(props)
    const styles = useStyles()
    const { onChannelSelect } = useChannelSelect()

    return {
      state,
      styles,
      onChannelSelect,
      path
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
.separator {
  width: 100%;
  height: 2px;
  margin: 4px 0;
}
.item {
  margin: 4px 0;
}
</style>
