<template>
  <div :class="$style.container">
    <user-icon :class="$style.icon" :size="32" :user-id="message.userId" />
    <div :class="$style.userName">{{ userName }}</div>
    <div :class="$style.content">{{ message.content }}</div>
    <div :class="$style.channelName">{{ channelName }}</div>
    <time :class="$style.date">{{ date }}</time>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { Message } from '@traptitech/traq'
import useChannelPath from '@/use/channelPath'
import UserIcon from '@/components/UI/UserIcon.vue'
import store from '@/store'

export default defineComponent({
  name: 'SearchResultMessageElement',
  components: {
    UserIcon
  },
  props: {
    message: {
      type: Object as PropType<Message>,
      required: true
    }
  },
  setup(props) {
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
    return { userName, channelName, date }
  }
})
</script>

<style lang="scss" module>
.container {
  display: grid;
  grid-template:
    'icon userName    userName'
    'icon content     content'
    'icon channelName date'
    /32px min-content 1fr;
  gap: 4px 16px;
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
.channelName {
  @include color-ui-secondary;
  @include size-body2;
  font-weight: bold;
  grid-area: channelName;
}
.date {
  @include color-ui-secondary;
  @include size-body2;
  grid-area: date;
}
</style>
