<template>
  <div :class="$style.container" @click="$emit('click')">
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
    <div v-if="!hideSubtitle" :class="$style.subTitleContainer">
      <user-name
        v-if="titleType === 'channel'"
        :user="userState"
        :class="$style.item"
      />
      <channel-name
        v-if="titleType === 'user'"
        :path="path"
        :class="$style.item"
      />
      <icon
        v-if="message.createdAt !== message.updatedAt"
        :class="$style.editIcon"
        :size="16"
        name="pencil"
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
import { defineComponent, PropType, computed } from '@vue/composition-api'
import { Message } from '@traptitech/traq'
import UserName from './UserName.vue'
import ChannelName from './ChannelName.vue'
import RenderContent from './RenderContent.vue'
import store from '@/store'
import useChannelPath from '@/use/channelPath'
import Icon from '@/components/UI/Icon.vue'

export default defineComponent({
  name: 'MessagePanel',
  components: {
    UserName,
    ChannelName,
    RenderContent,
    Icon
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
      type: Object as PropType<Message>,
      required: true
    },
    lineClampContent: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const userState = computed(
      () => store.state.entities.users[props.message.userId]
    )
    if (userState.value === undefined) {
      store.dispatch.entities.fetchUser(props.message.userId)
    }

    const { channelIdToShortPathString } = useChannelPath()

    const path = computed(() =>
      channelIdToShortPathString(props.message.channelId)
    )

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
