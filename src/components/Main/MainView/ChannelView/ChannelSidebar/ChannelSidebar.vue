<template>
  <PrimaryViewSidebar :is-sidebar-opener-ready="isSidebarOpenerReady">
    <template #page>
      <div :class="$style.panel">
        <div :class="$style.controls">
          <button
            type="button"
            :class="$style.control"
            aria-label="サイドバーを閉じる"
            title="サイドバーを閉じる"
            @click="closeSidebar"
          >
            <AIcon mdi name="chevron-double" :class="$style.closeIcon" />
          </button>
          <button
            type="button"
            :class="$style.modeControl"
            aria-label="チャンネル情報"
            title="チャンネル情報"
            :aria-pressed="sidebarMode === 'information'"
            @click="sidebarMode = 'information'"
          >
            <AIcon mdi name="info-outline" :class="$style.modeIcon" />
          </button>
          <button
            type="button"
            :class="$style.modeControl"
            aria-label="スレッド一覧"
            title="スレッド一覧"
            :aria-pressed="sidebarMode === 'threads'"
            @click="sidebarMode = 'threads'"
          >
            <AIcon mdi name="message-text-outline" :class="$style.modeIcon" />
          </button>
        </div>
        <ChannelInfomationSidebar
          v-if="sidebarMode === 'information'"
          v-model:is-viewers-detail-open="isViewersDetailOpen"
          :channel-id="channelId"
          :pinned-messages="pinnedMessages"
          :active-viewing-users="activeViewingUsers"
          :inactive-viewing-users="inactiveViewingUsers"
        />
        <ChannelThreadsSidebar v-else />
      </div>
    </template>
    <template #opener>
      <ChannelInfomationSidebarHidden
        v-if="sidebarMode === 'information'"
        :viewer-ids="activeViewingUsers"
        :inactive-viewer-ids="inactiveViewingUsers"
        @open="openSidebar"
        @open-viewers="openInformationViewers"
      />
      <PrimaryViewSidebarHidden v-else @open="openSidebar" />
    </template>
  </PrimaryViewSidebar>
</template>

<script lang="ts" setup>
import type { Pin } from '@traptitech/traq'

import { ref } from 'vue'

import PrimaryViewSidebar from '/@/components/Main/MainView/PrimaryViewSidebar/PrimaryViewSidebar.vue'
import PrimaryViewSidebarHidden from '/@/components/Main/MainView/PrimaryViewSidebar/PrimaryViewSidebarHidden.vue'
import AIcon from '/@/components/UI/AIcon.vue'
import useSidebar from '/@/composables/mainView/useSidebar'
import type { ChannelId, UserId } from '/@/types/entity-ids'

import ChannelInfomationSidebar from './ChannelInfomationSidebar/ChannelInfomationSidebar.vue'
import ChannelInfomationSidebarHidden from './ChannelInfomationSidebar/ChannelInfomationSidebarHidden.vue'
import ChannelThreadsSidebar from './ChannelThreadsSidebar/ChannelThreadsSidebar.vue'

defineProps<{
  channelId: ChannelId
  isSidebarOpenerReady: boolean
  pinnedMessages: Pin[]
  activeViewingUsers: UserId[]
  inactiveViewingUsers: UserId[]
}>()

const sidebarMode = ref<'information' | 'threads'>('information')
const isViewersDetailOpen = ref(false)
const { openSidebar, closeSidebar } = useSidebar()

const openInformationViewers = () => {
  sidebarMode.value = 'information'
  isViewersDetailOpen.value = true
  openSidebar()
}
</script>

<style lang="scss" module>
.panel {
  position: relative;
  height: 100%;
}

.controls {
  @include color-ui-secondary;
  position: absolute;
  right: 100%;
  top: 0;
  display: flex;
  flex-direction: column;
  padding: 8px;
  background: var(--specific-side-bar-background);
  border-radius: 8px 0 0 8px;
}

.control,
.modeControl {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  color: inherit;
  background: transparent;
  cursor: pointer;
}

.control {
  width: 40px;
  height: 40px;
  border-radius: 4px;
}

.modeControl {
  @include color-accent-primary;
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 100vw;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: currentColor;
    opacity: 0;
    pointer-events: none;
  }

  &:hover::after,
  &:active::after,
  &[aria-pressed='true']::after {
    opacity: 0.1;
  }
}

.modeIcon {
  opacity: 0.3;

  .modeControl:hover & {
    opacity: 0.7;
  }

  .modeControl[aria-pressed='true'] & {
    opacity: 1;
  }
}

.closeIcon {
  transform: rotate(180deg);
}

// The mobile drawer clips content outside its 320px width.
[data-is-mobile] {
  .panel {
    padding-top: 56px;
  }

  .controls {
    right: 0;
    left: 0;
    flex-direction: row;
    border-radius: 0;
  }
}
</style>
