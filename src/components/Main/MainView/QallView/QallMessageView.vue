<script lang="ts" setup>
import { computed, nextTick, ref, shallowRef } from 'vue'
import useChannelMessageFetcher from '../ChannelView/ChannelViewContent/composables/useChannelMessageFetcher'
import MessageElement from '/@/components/Main/MainView/MessageElement/MessageElement.vue'
import MessageInput from '/@/components/Main/MainView/MessageInput/MessageInput.vue'
import MessagesScroller from '/@/components/Main/MainView/MessagesScroller/MessagesScroller.vue'
import ScrollLoadingBar from '/@/components/Main/MainView/ScrollLoadingBar.vue'
import IconButton from '/@/components/UI/IconButton.vue'
import { useSubscriptionStore } from '/@/store/domain/subscription'
import { useChannelsStore } from '/@/store/entities/channels'
import { useMessagesStore } from '/@/store/entities/messages'
import type { ChannelId, UserId } from '/@/types/entity-ids'

const props = defineProps<{
  channelId: ChannelId
  typingUsers: UserId[]
}>()

const isMessageShow = ref(false)

const scrollerEle = shallowRef<{ $el: HTMLDivElement } | undefined>()
const {
  messageIds,
  isReachedEnd,
  isReachedLatest,
  isLoading,
  lastLoadingDirection,
  unreadSince,
  onLoadFormerMessagesRequest,
  onLoadLatterMessagesRequest
} = useChannelMessageFetcher(scrollerEle, props)
const { messagesMap } = useMessagesStore()

const { channelsMap } = useChannelsStore()
const isArchived = computed(
  () => channelsMap.value.get(props.channelId)?.archived ?? false
)

const { unreadChannelsMap, deleteUnreadChannelWithSend } =
  useSubscriptionStore()

const resetIsReachedLatest = () => {
  if (!unreadChannelsMap.value.get(props.channelId)) return
}

const showToNewMessageButton = ref(false)
const toNewMessage = (behavior?: ScrollBehavior) => {
  if (!scrollerEle.value) return
  showToNewMessageButton.value = false
  scrollerEle.value.$el.scrollTo({
    top: scrollerEle.value.$el.scrollHeight,
    behavior: behavior
  })
}

const handleScroll = () => {
  if (scrollerEle.value === undefined || isLoading.value) return
  const { scrollTop, scrollHeight, clientHeight } = scrollerEle.value.$el
  showToNewMessageButton.value = scrollHeight - 2 * clientHeight > scrollTop
  if (!isReachedLatest.value) {
    showToNewMessageButton.value = true
  }
}
</script>

<template>
  <div
    :class="$style.container"
    :data-is-not-messages-show="$boolAttr(!isMessageShow)"
  >
    <div :class="$style.mainViewContainer">
      <div
        :class="$style.messageContainer"
        :data-is-not-messages-show="$boolAttr(!isMessageShow)"
      >
        <scroll-loading-bar
          :class="$style.loadingBar"
          :show="isLoading && isMessageShow"
        />
        <transition name="fade-bottom" mode="out-in">
          <div
            v-if="isMessageShow"
            :class="$style.messageContainerBackgroundContainer"
          >
            <div :class="$style.messageContainerBackground" />

            <messages-scroller
              v-if="isMessageShow"
              ref="scrollerEle"
              :message-ids="messageIds"
              :is-reached-end="isReachedEnd"
              :is-reached-latest="isReachedLatest"
              :is-loading="isLoading"
              :last-loading-direction="lastLoadingDirection"
              @request-load-former="onLoadFormerMessagesRequest"
              @request-load-latter="onLoadLatterMessagesRequest"
              @scroll-passive="handleScroll"
              @reset-is-reached-latest="resetIsReachedLatest"
            >
              <template
                #default="{ messageId, onChangeHeight, onEntryMessageLoaded }"
              >
                <message-element
                  :class="$style.element"
                  :message-id="messageId"
                  :is-archived="isArchived"
                  @change-height="onChangeHeight"
                  @entry-message-loaded="onEntryMessageLoaded"
                />
              </template>
            </messages-scroller>
          </div>
        </transition>
        <div :class="[$style.uiElement, $style.uiToggleButton]">
          <IconButton
            :icon-name="`chevron-double-${isMessageShow ? 'down' : 'up'}`"
            icon-mdi
            @click="
              () => {
                if (isMessageShow) {
                  isMessageShow = false
                  toNewMessage('smooth')
                } else {
                  isMessageShow = true
                  nextTick(() => toNewMessage())
                }
              }
            "
          />
        </div>
      </div>
      <slot name="default" />
    </div>
    <message-input
      :channel-id="channelId"
      :typing-users="typingUsers"
      :show-to-new-message-button="false"
      force-mobile-style
    />
  </div>
</template>

<style lang="scss" module>
.container {
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
}

.mainViewContainer {
  flex-grow: 1;
  position: relative;
}

.messageContainer {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 33%;
  min-width: 25rem;
  height: 100%;

  display: flex;
  flex: 1 1;
  flex-direction: column;
  justify-content: end;
  &[data-is-not-messages-show] {
    pointer-events: none;
  }
  z-index: 400;
}

.messageContainerBackgroundContainer {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
}

.messageContainerBackground {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  opacity: 0.7;
  backdrop-filter: blur(100px);

  @include background-primary;
}

.loadingBar {
  position: absolute;
  top: 0;
  width: 100%;
  height: 12px;
  z-index: $z-index-message-loading;
}

.unreadSeparator {
  color: $theme-accent-notification-default;
}

.dateSeparator {
  @include color-ui-secondary;
}
.element {
  margin: 4px 0;
  contain: content;
}
.uiElement {
  pointer-events: all;
}

.uiToggleButton {
  @include color-ui-secondary;
  @include background-primary;
  padding: 0.5rem;
  border-radius: 2rem;
  position: absolute;
  bottom: 1rem;
  right: 1rem;
}
</style>
