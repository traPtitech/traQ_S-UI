<template>
  <RouterLink
    :to="to"
    :class="$style.thread"
    :data-is-archived="$boolAttr(archived)"
  >
    <div :class="$style.titleRow">
      <h3 :class="$style.title">
        <bdi>{{ title }}</bdi>
      </h3>
      <UnreadBadge
        :unread-count="unread?.count"
        :is-noticeable="unread?.noticeable"
      />
    </div>
    <div v-if="creatorName" :class="$style.creator">
      作成者：<bdi>@{{ creatorName }}</bdi>
    </div>
    <blockquote v-if="parentPreview" :class="$style.quote">
      <div :class="$style.author">
        <img
          :class="$style.avatar"
          :src="parentPreview.authorIconUrl"
          width="24"
          height="24"
          alt=""
        />
        <bdi :class="$style.authorName">@{{ parentPreview.authorName }}</bdi>
      </div>
      <RenderContent :content="parentPreview.content" line-clamp-content />
      <time
        :class="$style.time"
        :datetime="parentPreview.createdAt"
        :title="getFullDayWithTimeString(new Date(parentPreview.createdAt))"
      >
        {{ parentDate }}
      </time>
    </blockquote>
  </RouterLink>
</template>

<script setup lang="ts">
import type { UnreadChannel } from '@traptitech/traq'

import { type RouteLocationRaw, RouterLink } from 'vue-router'

import RenderContent from '/@/components/UI/MessagePanel/RenderContent.vue'
import UnreadBadge from '/@/components/UI/UnreadBadge.vue'
import { useDateRepresentation } from '/@/composables/useDateRepresentation'
import { getFullDayWithTimeString } from '/@/lib/basic/date'

const props = defineProps<{
  to: RouteLocationRaw
  title: string
  archived: boolean
  creatorName?: string
  unread?: Pick<UnreadChannel, 'count' | 'noticeable'>
  parentPreview?: {
    authorName: string
    authorIconUrl: string
    content: string
    createdAt: string
  }
}>()

const parentDate = useDateRepresentation(
  () => props.parentPreview?.createdAt ?? ''
)
</script>

<style lang="scss" module>
.thread {
  @include background-primary;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  padding: 12px 14px;
  border-radius: 4px;
  cursor: pointer;
  &[data-is-archived] {
    opacity: 0.5;
  }
  &:focus-visible {
    outline: 2px solid $theme-accent-focus-default;
    outline-offset: 2px;
  }
}

.titleRow {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.title {
  @include color-ui-primary;
  @include size-body1;
  display: -webkit-box;
  flex: 1;
  min-width: 0;
  margin: 0;
  overflow: hidden;
  overflow-wrap: anywhere;
  font-weight: bold;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.creator,
.author,
.time {
  @include color-ui-secondary;
  @include size-body2;
}

.creator,
.authorName {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.quote {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 10px 0 0;
  padding-left: 10px;
  border-left: 2px solid $theme-ui-secondary-default;
}

.author {
  display: flex;
  align-items: center;
  gap: 6px;
}

.avatar {
  flex-shrink: 0;
  border-radius: 50%;
  object-fit: cover;
}

.time {
  align-self: flex-end;
  white-space: nowrap;
}
</style>
