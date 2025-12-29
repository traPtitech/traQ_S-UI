<template>
  <router-link :to="to">
    <div :class="$style.container">
      <div :class="$style.header">
        <UserName
          v-if="titleType === 'user'"
          :class="$style.item"
          :user="userState"
          is-title
        />
        <ChannelName
          v-if="titleType === 'channel'"
          :class="$style.item"
          :path="path"
          is-title
        />
        <AIcon
          v-if="showContextMenuButton"
          :class="$style.icon"
          :size="28"
          mdi
          name="dots-horizontal"
          @click.prevent="onClickContextMenuButton"
        />
      </div>
      <div :class="$style.separator" />
      <div
        v-if="!hideSubtitle"
        :class="[$style.subTitleContainer, $style.item]"
      >
        <UserName v-if="titleType === 'channel'" :user="userState" />
        <ChannelName v-if="titleType === 'user'" :path="path" />
        <AIcon
          v-if="message.createdAt !== message.updatedAt"
          :class="$style.editIcon"
          :size="16"
          name="pencil-outline"
          mdi
        />
      </div>
      <RenderContent
        :content="message.content"
        :line-clamp-content="lineClampContent"
      />
    </div>
  </router-link>
</template>

<script lang="ts" setup>
import type { ActivityTimelineMessage, Message } from '@traptitech/traq'

import { computed } from 'vue'

import AIcon from '/@/components/UI/AIcon.vue'
import useChannelPath from '/@/composables/useChannelPath'
import { setFallbackForNullishOrOnError } from '/@/lib/basic/fallback'
import { useUsersStore } from '/@/store/entities/users'

import ChannelName from './ChannelName.vue'
import RenderContent from './RenderContent.vue'
import UserName from './UserName.vue'

const props = withDefaults(
  defineProps<{
    titleType?: 'channel' | 'user'
    hideSubtitle?: boolean
    message: Message | ActivityTimelineMessage
    lineClampContent?: boolean
    showContextMenuButton?: boolean
    to: string
  }>(),
  {
    titleType: 'channel' as const,
    hideSubtitle: false,
    lineClampContent: false,
    showContextMenuButton: false
  }
)

const emit = defineEmits<{
  (e: 'clickContextMenuButton', _e: MouseEvent): void
}>()

const { usersMap, fetchUser } = useUsersStore()

const userState = computed(() => usersMap.value.get(props.message.userId))
if (userState.value === undefined) {
  fetchUser({ userId: props.message.userId })
}

const { channelIdToShortPathString } = useChannelPath()

const path = computed(() =>
  setFallbackForNullishOrOnError('unknown').exec(() =>
    channelIdToShortPathString(props.message.channelId)
  )
)

const onClickContextMenuButton = (e: MouseEvent) => {
  emit('clickContextMenuButton', e)
}
</script>

<style lang="scss" module>
.container {
  @include background-primary;
  border-radius: 4px;
  padding: 8px 16px;
}
.header {
  display: flex;
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
.icon {
  display: block;
  padding: 4px;
  cursor: pointer;
  margin-left: auto;
  border-radius: 4px;
  &:hover {
    @include background-secondary;
  }
}
</style>
