<template>
  <div :class="$style.container">
    <user-name
      v-if="titleType === 'user'"
      :class="$style.item"
      :user="userState"
      is-title
    />
    <channel-name
      v-if="titleType === 'channel'"
      :class="$style.item"
      :path="path"
      is-title
    />
    <div :class="$style.separator" />
    <div v-if="!hideSubtitle" :class="[$style.subTitleContainer, $style.item]">
      <user-name v-if="titleType === 'channel'" :user="userState" />
      <channel-name v-if="titleType === 'user'" :path="path" />
      <a-icon
        v-if="message.createdAt !== message.updatedAt"
        :class="$style.editIcon"
        :size="16"
        name="pencil-outline"
        mdi
      />
    </div>
    <render-content
      :content="message.content"
      :line-clamp-content="lineClampContent"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { ActivityTimelineMessage, Message } from '@traptitech/traq'
import UserName from './UserName.vue'
import ChannelName from './ChannelName.vue'
import RenderContent from './RenderContent.vue'
import store from '/@/store'
import useChannelPath from '/@/use/channelPath'
import AIcon from '/@/components/UI/AIcon.vue'

export default defineComponent({
  name: 'MessagePanel',
  components: {
    UserName,
    ChannelName,
    RenderContent,
    AIcon
  },
  props: {
    titleType: {
      type: String as PropType<'channel' | 'user'>,
      default: 'channel' as const
    },
    hideSubtitle: {
      type: Boolean,
      default: false
    },
    message: {
      type: Object as PropType<Message | ActivityTimelineMessage>,
      required: true
    },
    lineClampContent: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const userState = computed(() =>
      store.state.entities.usersMap.get(props.message.userId)
    )
    if (userState.value === undefined) {
      store.dispatch.entities.fetchUser({ userId: props.message.userId })
    }

    const { channelIdToShortPathString } = useChannelPath()

    const path = computed(() => {
      try {
        return channelIdToShortPathString(props.message.channelId)
      } catch {
        return 'unknown'
      }
    })

    return { userState, path }
  }
})
</script>

<style lang="scss" module>
.container {
  @include background-primary;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
}
.separator {
  @include background-secondary;
  width: 100%;
  height: 2px;
  margin: 4px 0;
}
.item {
  margin: 4px 0;
}
.editIcon {
  @include color-ui-secondary;
  margin-left: 4px;
  flex-shrink: 0;
}
.subTitleContainer {
  display: flex;
  align-items: center;
}
</style>
