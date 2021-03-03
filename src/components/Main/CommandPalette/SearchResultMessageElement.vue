<template>
  <div :class="$style.container" @click="onClick">
    <message-contents :message-id="message.id" />
    <div :class="$style.channelAndDate">
      {{ channelName }} - <time :class="$style.date">{{ date }}</time>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { Message } from '@traptitech/traq'
import useChannelPath from '@/use/channelPath'
// import UserIcon from '@/components/UI/UserIcon.vue'
import store from '@/store'
import { MessageId } from '@/types/entity-ids'
import MessageContents from '../MainView/MessageElement/MessageContents.vue'

export default defineComponent({
  name: 'SearchResultMessageElement',
  components: {
    // UserIcon,
    MessageContents
  },
  props: {
    message: {
      type: Object as PropType<Message>,
      required: true
    }
  },
  emits: {
    clickOpen: (messageId: MessageId) => true
  },
  setup(props, { emit }) {
    const { channelIdToPathString } = useChannelPath()
    const userName = computed(
      () => store.state.entities.usersMap.get(props.message.userId)?.name ?? ''
    )
    const channelName = computed(() =>
      channelIdToPathString(props.message.channelId, true)
    )
    const date = computed(() =>
      new Date(props.message.updatedAt).toDateString()
    )
    const onClick = () => emit('clickOpen', props.message.id)
    return { userName, channelName, date, onClick }
  }
})
</script>

<style lang="scss" module>
.container {
  display: grid;
  grid-template:
    'icon userName'
    'icon content'
    'icon channelAndDate'
    /32px 1fr;
  gap: 4px 16px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  &:hover {
    @include background-secondary;
  }
}
.icon {
  grid-area: icon;
}
.userName {
  @include color-ui-primary;
  font-weight: bold;
  grid-area: userName;
}
.content {
  @include color-ui-primary;
  grid-area: content;
  -webkit-line-clamp: 3;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.channelAndDate {
  @include color-ui-secondary;
  @include size-body2;
  grid-area: channelAndDate;
}
</style>
