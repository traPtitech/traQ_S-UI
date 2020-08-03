<template>
  <div v-if="isMinimum" :class="$style.container" data-is-minimum>
    <icon
      :class="$style.icon"
      :size="28"
      mdi
      name="dots-horizontal"
      @click="onDotsClick"
    />
  </div>
  <div v-else :class="$style.container" :data-is-mobile="isMobile">
    <transition name="quick-reaction">
      <div v-if="showQuickReaction || !isMobile" :class="$style.quickReaction">
        <stamp
          v-for="stamp in recentStamps"
          :key="stamp"
          :stamp-id="stamp"
          @click.native="addStamp(stamp)"
          :size="28"
          :class="$style.stampListItem"
        />
        <span :class="$style.line" />
      </div>
    </transition>
    <div
      :class="$style.tools"
      :data-hide-left-border="showQuickReaction || !isMobile"
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
        @click="onStampIconClick"
      />
      <icon
        :class="$style.icon"
        :size="28"
        mdi
        name="dots-horizontal"
        @click="onDotsClick"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType, ref } from 'vue'
import store from '@/store'
import Icon from '@/components/UI/Icon.vue'
import Stamp from '@/components/UI/Stamp.vue'
import { StampId, MessageId } from '@/types/entity-ids'
import useStampPickerInvoker from '@/use/stampPickerInvoker'
import { teleportTargetName } from '@/views/Main.vue'
import useIsMobile from '@/use/isMobile'

export default defineComponent({
  name: 'MessageTools',
  components: {
    Icon,
    Stamp
  },
  props: {
    messageId: { type: String as PropType<MessageId>, required: true },
    isMinimum: { type: Boolean, default: false }
  },
  setup(props) {
    const recentStamps = computed(() =>
      store.getters.domain.me.recentStampIds.slice(0, 3)
    )
    const addStamp = (stampId: StampId) => {
      store.dispatch.domain.messagesView.addStamp({
        messageId: props.messageId,
        stampId
      })
    }

    const { invokeStampPicker } = useStampPickerInvoker(
      teleportTargetName,
      stampData => {
        addStamp(stampData.id)
      }
    )
    const onStampIconClick = (e: MouseEvent) => {
      if (store.getters.ui.stampPicker.isStampPickerShown) {
        store.dispatch.ui.stampPicker.closeStampPicker()
      } else {
        invokeStampPicker({ x: e.pageX, y: e.pageY })
      }
    }

    const onDotsClick = (e: MouseEvent) => {
      store.dispatch.ui.messageContextMenu.openMessageContextMenu({
        messageId: props.messageId,
        x: e.pageX,
        y: e.pageY,
        isMinimum: props.isMinimum
      })
    }

    const { isMobile } = useIsMobile()
    const showQuickReaction = ref(!isMobile.value)
    const toggleQuickReaction = () =>
      (showQuickReaction.value = !showQuickReaction.value)

    return {
      recentStamps,
      addStamp,
      onDotsClick,
      onStampIconClick,
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
  @include background-primary;
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
  @include background-primary;
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
