<template>
  <div
    :class="$style.container"
    :style="styles.container"
    @click="onChannelSelect(state.channelId)"
  >
    <div :class="$style.name" :style="styles.name">
      {{ state.channelName }}
    </div>
    <div :class="$style.separator" :style="styles.separator"></div>
    <activity-element-user-name
      v-if="state.user"
      :user="state.user"
      :class="$style.user"
    />
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
import { Message } from '@traptitech/traq'
import store from '@/store'
import useChannelSelect from '@/use/channelSelect'
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
    name: makeStyles(theme => ({
      color: theme.ui.secondary
    })),
    separator: makeStyles(theme => ({
      background: theme.background.tertiary
    }))
  })

export default defineComponent({
  name: 'ActivityElement',
  components: {
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
    const state = reactive({
      channelName: computed(
        () =>
          store.state.entities.channels[props.message.channelId ?? '']?.name ??
          ''
      ),
      channelId: computed(() => props.message.channelId ?? ''),
      user: computed(
        () => store.state.entities.users[props.message.userId ?? '']
      )
    })
    const styles = useStyles()
    const { onChannelSelect } = useChannelSelect(context)
    return {
      props,
      state,
      styles,
      onChannelSelect
    }
  }
})
</script>

<style lang="scss" module>
.container {
  border-radius: 4px;
  padding: 8px 20px;
  cursor: pointer;
}
.name {
  font-size: 1.125rem;
  font-weight: bold;
  &::before {
    content: '# ';
  }
}
.separator {
  width: 100%;
  height: 2px;
  margin: 4px 0;
}
.user {
  margin-bottom: 1px;
}
</style>
