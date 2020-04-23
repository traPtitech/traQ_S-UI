<template>
  <div :class="$style.container" :style="styles.container">
    <stamp-picker-stamp-list-item
      v-for="stamp in recentStamps"
      :key="stamp"
      :stamp-id="stamp"
      @click="addStamp(stamp)"
      :size="16"
      :class="$style.stampListItem"
    />
    <div :class="$style.emojiOutline">
      <icon
        mdi
        name="emoticon-outline"
        :size="16"
        :class="$style.emojiIcon"
        @click="clickStampIcon"
      />
    </div>
    <div>
      <icon
        :class="$style.dotIcon"
        :size="16"
        mdi
        name="dots-horizontal"
        @click="clickDots"
      />
    </div>
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

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.primary,
      color: theme.ui.tertiary
    }))
  })

export default defineComponent({
  name: 'MessageToolsContent',
  components: {
    Icon,
    Stamp,
    StampPickerStampListItem
  },
  props: { messageId: { type: String as PropType<MessageId>, required: true } },
  setup(props, context) {
    const styles = useStyles()
    const addStamp = (stampId: StampId) => {
      store.dispatch.domain.messagesView.addStamp({
        messageId: props.messageId,
        stampId
      })
      store.commit.domain.me.pushLocalStampHistory({
        stampId: stampId,
        datetime: new Date()
      })
    }
    const clickDots = (e: MouseEvent) => {
      context.emit('open', 'dot', e)
    }
    const clickStampIcon = (e: MouseEvent) => {
      context.emit('open', 'stampPicker', e)
    }
    const recentStamps = computed(() =>
      store.getters.domain.me.recentStampIds.slice(0, 3)
    )
    return {
      styles,
      addStamp,
      recentStamps,
      clickDots,
      clickStampIcon
    }
  }
})
</script>

<style lang="scss" module>
.container {
  height: 24px;
  width: 104px;
  border-radius: 4px;
  border: solid 2px;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 3px 0;
  padding: 4px;
  justify-content: space-between;
}

.emojiOutline {
  border-left: solid 2px;
  padding-left: 4px;
  height: 16px;
  margin-left: 2px;
}

.emojiIcon {
  margin-bottom: 4px;
  cursor: pointer;
}

.dotIcon {
  margin-top: 4px;
  cursor: pointer;
}

.stampListItem {
  width: 16px;
  height: 16px;
  cursor: pointer;
  user-select: none;
}
</style>
