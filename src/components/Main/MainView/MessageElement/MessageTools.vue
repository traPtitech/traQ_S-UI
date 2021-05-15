<template>
  <div
    v-if="show || isStampPickerOpen || isThisContextMenuShown"
    ref="containerEle"
    :class="$style.container"
    :data-is-mobile="$boolAttr(isMobile)"
    :data-is-minimum="$boolAttr(isMinimum)"
  >
    <template v-if="isMinimum">
      <icon
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
          <stamp
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
          <icon
            v-if="showQuickReaction"
            mdi
            name="chevron-right"
            :size="28"
            :class="$style.icon"
            @click="toggleQuickReaction"
          />
          <icon
            v-else
            mdi
            name="chevron-left"
            :size="28"
            :class="$style.icon"
            @click="toggleQuickReaction"
          />
        </template>
        <icon
          mdi
          name="emoticon-outline"
          :size="28"
          :class="$style.icon"
          @click="toggleStampPicker"
        />
        <icon
          :class="$style.icon"
          :size="28"
          mdi
          name="dots-horizontal"
          @click="onDotsClick"
        />
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType, ref } from 'vue'
import store from '@/store'
import Icon from '@/components/UI/Icon.vue'
import Stamp from '@/components/UI/Stamp.vue'
import { StampId, MessageId } from '@/types/entity-ids'
import { useStampPickerInvoker } from '@/providers/stampPicker'
import useIsMobile from '@/use/isMobile'
import apis from '@/lib/apis'
import { useMessageContextMenuInvoker } from '@/components/Main/MainView/MessagesScroller/providers/messageContextMenu'
import useToastStore from '@/providers/toastStore'

const pushInitialRecentStampsIfNeeded = (recents: StampId[]) => {
  if (recents.length >= 3) return

  const initials = store.getters.entities.initialRecentStamps.map(
    stamp => stamp.id
  )
  for (const s of initials) {
    if (recents.length >= 3) return
    if (recents.includes(s)) return

    recents.push(s)
  }
}

export default defineComponent({
  name: 'MessageTools',
  components: {
    Icon,
    Stamp
  },
  props: {
    messageId: { type: String as PropType<MessageId>, required: true },
    isMinimum: { type: Boolean, default: false },
    show: { type: Boolean, default: false }
  },
  setup(props) {
    const { addErrorToast } = useToastStore()

    const recentStamps = computed(() => {
      const recents = store.getters.domain.me.recentStampIds.slice(0, 3)
      pushInitialRecentStampsIfNeeded(recents)
      return recents
    })
    const addStamp = async (stampId: StampId) => {
      try {
        await apis.addMessageStamp(props.messageId, stampId)
      } catch {
        addErrorToast('メッセージにスタンプを追加できませんでした')
        return
      }
      store.commit.domain.me.upsertLocalStampHistory({
        stampId,
        datetime: new Date()
      })
    }

    const containerEle = ref<HTMLDivElement>()
    const { isThisOpen: isStampPickerOpen, toggleStampPicker } =
      useStampPickerInvoker(async stampData => {
        try {
          await apis.addMessageStamp(props.messageId, stampData.id)
        } catch {
          addErrorToast('メッセージにスタンプを追加できませんでした')
        }
      }, containerEle)

    const { isThisContextMenuShown, openContextMenu } =
      useMessageContextMenuInvoker(props)

    const onDotsClick = (e: MouseEvent) => {
      openContextMenu({
        x: e.pageX,
        y: e.pageY
      })
    }

    const { isMobile } = useIsMobile()
    const showQuickReaction = ref(!isMobile.value)
    const toggleQuickReaction = () =>
      (showQuickReaction.value = !showQuickReaction.value)

    return {
      containerEle,
      isThisContextMenuShown,
      isStampPickerOpen,
      recentStamps,
      addStamp,
      onDotsClick,
      toggleStampPicker,
      isMobile,
      showQuickReaction,
      toggleQuickReaction
    }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-tertiary;
  @include background-primary;
  display: flex;
  align-items: center;
  border-radius: 4px;
  contain: content;
  &:not([data-is-mobile]) {
    box-shadow: 0 1px 3px 0;
  }
  &[data-is-minimum] {
    border: solid 2px $theme-ui-tertiary;
  }
}

.quickReaction {
  display: flex;
  flex-direction: row;
  align-items: center;

  border: solid 2px $theme-ui-tertiary;
  border-radius: 4px;
  border-right: none;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.tools {
  display: flex;
  flex-direction: row;
  align-items: center;

  border: solid 2px $theme-ui-tertiary;
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
