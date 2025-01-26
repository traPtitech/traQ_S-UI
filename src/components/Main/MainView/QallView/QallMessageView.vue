<script lang="ts" setup>
import MessagesScroller from '/@/components/Main/MainView/MessagesScroller/MessagesScroller.vue'
import MessageInput from '/@/components/Main/MainView/MessageInput/MessageInput.vue'
import ScrollLoadingBar from '/@/components/Main/MainView/ScrollLoadingBar.vue'
import { computed, nextTick, ref, shallowRef } from 'vue'
import type { ChannelId, UserId } from '/@/types/entity-ids'
import useChannelMessageFetcher from '../ChannelView/ChannelViewContent/composables/useChannelMessageFetcher'
import { useChannelsStore } from '/@/store/entities/channels'
import MessageElement from '/@/components/Main/MainView/MessageElement/MessageElement.vue'
import { useSubscriptionStore } from '/@/store/domain/subscription'

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
  onLoadFormerMessagesRequest,
  onLoadLatterMessagesRequest
} = useChannelMessageFetcher(scrollerEle, props)

const { channelsMap } = useChannelsStore()
const isArchived = computed(
  () => channelsMap.value.get(props.channelId)?.archived ?? false
)

const { unreadChannelsMap } = useSubscriptionStore()
const resetIsReachedLatest = () => {
  if (!unreadChannelsMap.value.get(props.channelId)) return
  isReachedLatest.value = false
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

const handleMessage = () => {
  if (isMessageShow.value) {
    isMessageShow.value = false
    toNewMessage('smooth')
  } else {
    isMessageShow.value = true
    nextTick(() => toNewMessage())
  }
}

defineExpose({
  handleMessage
})
</script>

<template>
  <div
    :class="$style.container"
    :data-is-not-messages-show="$boolAttr(!isMessageShow)"
  >
    <div :class="$style.mainViewConteiner">
      <div :class="$style.messageContainer">
        <scroll-loading-bar
          :class="$style.loadingBar"
          :show="isLoading && isMessageShow"
        />
        <transition name="fade-bottom" mode="out-in">
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
        </transition>
      </div>
      <slot name="default"></slot>
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

.mainViewConteiner {
  flex-grow: 1;
  position: relative;
}

.messageContainer {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 30%;
  height: 100%;

  display: flex;
  flex: 1 1;
  flex-direction: column;
  justify-content: end;
  &[data-is-not-messages-show] {
    pointer-events: none;
  }
}

.loadingBar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
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
</style>
