<template>
  <div
    v-if="show || isStampPickerOpen || contextMenuPosition"
    ref="containerEle"
    :class="$style.container"
    :data-is-mobile="$boolAttr(isMobile)"
    :data-is-minimum="$boolAttr(isMinimum)"
  >
    <template v-if="isMinimum">
      <a-icon
        :class="$style.icon"
        :size="28"
        mdi
        name="dots-horizontal"
        @click="onDotsClick"
      />
    </template>
    <template v-else>
      <transition name="quick-reaction">
        <div
          v-if="showQuickReaction || !isMobile"
          :class="$style.quickReaction"
        >
          <a-stamp
            v-for="stamp in recentStamps"
            :key="stamp"
            :stamp-id="stamp"
            :size="28"
            :class="$style.stampListItem"
            @click="addStamp(stamp)"
          />
          <span :class="$style.line" />
        </div>
      </transition>
      <div
        :class="$style.tools"
        :data-hide-left-border="$boolAttr(showQuickReaction || !isMobile)"
      >
        <template v-if="isMobile">
          <a-icon
            v-if="showQuickReaction"
            mdi
            name="chevron-right"
            :size="28"
            :class="$style.icon"
            @click="toggleQuickReaction"
          />
          <a-icon
            v-else
            mdi
            name="chevron-left"
            :size="28"
            :class="$style.icon"
            @click="toggleQuickReaction"
          />
        </template>
        <a-icon
          mdi
          name="emoticon-outline"
          :size="28"
          :class="$style.icon"
          @click="toggleStampPicker"
        />
        <a-icon
          :class="$style.icon"
          :size="28"
          mdi
          name="dots-horizontal"
          @click="onDotsClick"
        />
      </div>
    </template>
    <message-context-menu
      v-if="contextMenuPosition"
      :position="contextMenuPosition"
      :message-id="messageId"
      :is-minimum="isMinimum"
      @close="closeContextMenu"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import type { StampId, MessageId } from '/@/types/entity-ids'
import { useStampPickerInvoker } from '/@/store/ui/stampPicker'
import { useResponsiveStore } from '/@/store/ui/responsive'
import apis from '/@/lib/apis'
import { useToastStore } from '/@/store/ui/toast'
import useContextMenu from '/@/composables/useContextMenu'
import { useStampsStore } from '/@/store/entities/stamps'
import type { Stamp } from '@traptitech/traq'
import AIcon from '/@/components/UI/AIcon.vue'
import AStamp from '/@/components/UI/AStamp.vue'
import MessageContextMenu from './MessageContextMenu.vue'
import useToggle from '/@/composables/utils/useToggle'
import { useStampHistory } from '/@/store/domain/stampHistory'

const props = withDefaults(
  defineProps<{
    messageId: MessageId
    isMinimum?: boolean
    show?: boolean
  }>(),
  {
    isMinimum: false,
    show: false
  }
)

const { recentStampIds, upsertLocalStampHistory } = useStampHistory()
const { addErrorToast } = useToastStore()
const { initialRecentStamps } = useStampsStore()

const pushInitialRecentStampsIfNeeded = (
  initialRecentStamps: Stamp[],
  recents: StampId[]
) => {
  if (recents.length >= 3) return

  const initials = initialRecentStamps.map(stamp => stamp.id)
  for (const s of initials) {
    if (recents.length >= 3) return
    if (recents.includes(s)) return

    recents.push(s)
  }
}

const recentStamps = computed(() => {
  const recents = recentStampIds.value.slice(0, 3)
  pushInitialRecentStampsIfNeeded(initialRecentStamps.value, recents)
  return recents
})
const addStamp = async (stampId: StampId) => {
  try {
    await apis.addMessageStamp(props.messageId, stampId)
  } catch {
    addErrorToast('メッセージにスタンプを追加できませんでした')
    return
  }
  upsertLocalStampHistory(stampId, new Date())
}

const containerEle = ref<HTMLDivElement>()
const { isThisOpen: isStampPickerOpen, toggleStampPicker } =
  useStampPickerInvoker(
    async stampData => {
      try {
        await apis.addMessageStamp(props.messageId, stampData.id)
      } catch {
        addErrorToast('メッセージにスタンプを追加できませんでした')
      }
    },
    containerEle,
    false
  )

const {
  position: contextMenuPosition,
  open: openContextMenu,
  close: closeContextMenu
} = useContextMenu()

const onDotsClick = (e: MouseEvent) => {
  openContextMenu({
    x: e.pageX,
    y: e.pageY
  })
}

const { isMobile } = useResponsiveStore()

const { value: showQuickReaction, toggle: toggleQuickReaction } = useToggle(
  !isMobile.value
)
</script>

<style lang="scss" module>
.container {
  @include color-ui-tertiary;
  @include background-primary;
  display: flex;
  border-radius: 4px;
  contain: content;
  &:not([data-is-mobile]) {
    box-shadow: 0 1px 3px 0;
  }
  &[data-is-minimum] {
    border: solid 2px $theme-ui-tertiary-default;
  }
}

.quickReaction {
  display: flex;
  flex-direction: row;
  align-items: center;

  border: solid 2px $theme-ui-tertiary-default;
  border-radius: 4px;
  border-right: none;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.tools {
  display: flex;
  flex-direction: row;
  align-items: center;

  border: solid 2px $theme-ui-tertiary-default;
  border-radius: 4px;
  &[data-hide-left-border] {
    border-left: none;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
}

.line {
  border-left: solid 2px;
  height: 20px;
  margin: 0 4px;
}

.icon {
  display: block;
  padding: 4px;
  cursor: pointer;
  &:hover {
    @include background-secondary;
  }
}

.stampListItem {
  padding: 4px;
  cursor: pointer;
  user-select: none;
  &:hover {
    @include background-secondary;
  }
}
</style>
