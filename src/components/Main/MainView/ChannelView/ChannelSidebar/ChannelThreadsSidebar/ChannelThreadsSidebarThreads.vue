<template>
  <div :class="$style.container">
    <router-link
      v-for="{
        thread,
        firstMessage,
        firstUser,
        firstMessageDate,
        unread
      } in threads"
      :key="thread.id"
      :to="constructChannelPath(`${channelPath}/${thread.id}`)"
      :class="$style.thread"
      :data-is-archived="$boolAttr(thread.archived)"
    >
      <h2 :class="$style.title">
        <UserIcon
          :class="$style.avatar"
          :user-id="firstUser.id"
          :size="24"
          prevent-modal
        />
        <bdi :class="$style.firstUser">
          {{ firstUser.displayName }}
        </bdi>
        <ChannelElementUnreadBadge
          :class="$style.unreadBadge"
          :unread-count="unread?.count"
          :is-noticeable="unread?.noticeable"
        />
      </h2>
      <RenderContent :content="firstMessage.content" line-clamp-content />
      <div :class="$style.separator" />
      <div :class="$style.footer">
        <UserIconEllipsisList
          :class="$style.participants"
          direction="row"
          :user-ids="thread.participantUserIds"
          :max="3"
          :icon-size="24"
          :border-width="2"
          :overlap="8"
          prevent-modal
        />
        <time
          :class="$style.time"
          :datetime="firstMessage.createdAt"
          :title="getFullDayWithTimeString(new Date(firstMessage.createdAt))"
        >
          {{ firstMessageDate.value }}
        </time>
      </div>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import ChannelElementUnreadBadge from '/@/components/Main/NavigationBar/ChannelList/ChannelElementUnreadBadge.vue'
import RenderContent from '/@/components/UI/MessagePanel/RenderContent.vue'
import UserIcon from '/@/components/UI/UserIcon.vue'
import UserIconEllipsisList from '/@/components/UI/UserIconEllipsisList.vue'
import useChannelPath from '/@/composables/useChannelPath'
import { useDateRepresentation } from '/@/composables/useDateRepresentation'
import { getFullDayWithTimeString } from '/@/lib/basic/date'
import { constructChannelPath } from '/@/router'

import {
  getMockThreadItems,
  getMockThreadMessages,
  mockThreadUsers
} from './mockThreads'

const props = defineProps<{
  channelId: string
}>()

const { channelIdToPathString } = useChannelPath()
const channelPath = computed(
  () => channelIdToPathString(props.channelId) ?? props.channelId
)

// TODO: スレッド一覧・メッセージ・発言者の取得処理に置き換える。
const threads = getMockThreadItems()
  .sort(
    (a, b) =>
      Number(a.thread.archived) - Number(b.thread.archived) ||
      b.latestMessage.createdAt.localeCompare(a.latestMessage.createdAt)
  )
  .map(({ thread, unread }) => {
    const firstMessage = getMockThreadMessages(thread.id)[0]
    if (!firstMessage) throw new Error('最初のメッセージのモックがありません')
    const firstUser = mockThreadUsers.find(
      user => user.id === firstMessage.userId
    )
    if (!firstUser) throw new Error('発言者のモックがありません')
    const firstMessageDate = useDateRepresentation(() => firstMessage.createdAt)
    return { thread, firstMessage, firstUser, firstMessageDate, unread }
  })
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.thread {
  @include background-primary;
  padding: 8px 16px;
  border-radius: 4px;
  min-width: 0;
  display: block;
  &[data-is-archived] {
    opacity: 0.5;
  }
  &:hover {
    @include background-secondary;
  }
}

.title {
  @include color-ui-primary;
  @include size-body1;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  overflow-wrap: anywhere;
  margin: 4px 0;
  font-weight: bold;
}

.separator {
  @include background-secondary;
  height: 2px;
  margin: 4px 0;
}

.footer {
  @include color-ui-secondary;
  @include size-body2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.avatar {
  flex-shrink: 0;
}

.firstUser {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unreadBadge {
  margin-left: auto;
  font-weight: normal;
}

.time {
  flex-shrink: 0;
  margin-left: auto;
  white-space: nowrap;
}

.participants {
  min-width: 0;
}
</style>
