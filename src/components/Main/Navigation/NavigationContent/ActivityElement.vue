<template>
  <div :class="$style.container" :style="styles.container">
    <activity-element-channel-name :name="state.channelName" />
    <div :class="$style.separator" :style="styles.separator"></div>
    <activity-element-user-name :name="'username'" />
    <activity-element-content :content="props.message.content" />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  SetupContext,
  computed,
  reactive
} from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import { Message } from '@/lib/api'
import store from '@/store'
import ActivityElementChannelName from './ActivityElementChannelName.vue'
import ActivityElementUserName from './ActivityElementUserName.vue'
import ActivityElementContent from './ActivityElementContent.vue'

type Props = {
  message: Message
}

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.primary
    })),
    separator: makeStyles(theme => ({
      background: theme.background.tertiary,
      width: '100%',
      height: '2px'
    }))
  })

export default defineComponent({
  name: 'ActivityElement',
  components: {
    ActivityElementChannelName,
    ActivityElementUserName,
    ActivityElementContent
  },
  props: {
    message: {
      type: Object,
      required: true
    }
  },
  setup(props: Props, context: SetupContext) {
    const containerStyle = makeStyles(theme => ({
      color: theme.ui.tertiary
    }))
    const state = reactive({
      channelName: computed(
        () =>
          store.state.entities.channels[props.message.channelId ?? '']?.name ??
          ''
      )
    })
    const styles = useStyles()
    return {
      props,
      state,
      styles
    }
  }
})
</script>

<style lang="scss" module>
.container {
  border-radius: 4px;
  padding: 8px 20px;
}
</style>
