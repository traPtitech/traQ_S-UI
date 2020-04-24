<template>
  <div :class="$style.container" :style="styles.container">
    <stamp-picker-stamp-list-item
      v-for="stamp in recentStamps"
      :key="stamp"
      :stamp-id="stamp"
      @click="addStamp(stamp)"
      :size="20"
      :class="$style.stampListItem"
    />
    <span :class="$style.line"></span>
    <icon
      mdi
      name="emoticon-outline"
      :size="20"
      :class="$style.emojiIcon"
      @click="onStampIconClick"
    />
    <icon
      :class="$style.dotIcon"
      :size="20"
      mdi
      name="dots-horizontal"
      @click="onDotsClick"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  PropType
} from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'
import Stamp from '@/components/UI/Stamp.vue'
import { StampId, MessageId } from '@/types/entity-ids'
import StampPickerStampListItem from '@/components/Main/StampPicker/StampPickerStampListItem.vue'
import useStampPickerInvoker from '@/use/stampPickerInvoker'
import { targetPortalName } from '@/views/Main.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.primary,
      color: theme.ui.tertiary
    }))
  })

export default defineComponent({
  name: 'MessageTools',
  components: {
    Icon,
    Stamp,
    StampPickerStampListItem
  },
  props: { messageId: { type: String as PropType<MessageId>, required: true } },
  setup(props) {
    const styles = useStyles()

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
      targetPortalName,
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
        y: e.pageY
      })
    }

    return {
      styles,
      recentStamps,
      addStamp,
      onDotsClick,
      onStampIconClick
    }
  }
})
</script>

<style lang="scss" module>
.container {
  border-radius: 4px;
  border: solid 2px;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 3px 0;
  padding: 4px;
  justify-content: space-between;
}

.line {
  border-left: solid 2px;
  height: 20px;
  margin: 0 4px;
}

.emojiIcon,
.dotIcon,
.stampListItem {
  cursor: pointer;
}

.stampListItem {
  user-select: none;
  margin: 0 2px;
}
</style>
