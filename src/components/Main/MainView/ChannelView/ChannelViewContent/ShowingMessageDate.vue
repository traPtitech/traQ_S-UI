<template>
  <div :class="$style.container">
    <div :class="$style.innerContainer">
      <button :class="$style.button" @click="handleTogglePopupMenu">
        {{ shownMessageDate }}
        <a-icon name="chevron-down" mdi />
      </button>
      <click-outside
        v-if="isPopupMenuShown"
        stop
        @click-outside="closePopupMenu"
      >
        <shown-message-date-menu
          :class="$style.toolsMenu"
          :message-ids="messageIds"
          @click="closePopupMenu"
        />
      </click-outside>
    </div>
  </div>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'
import type { ChannelId } from '/@/types/entity-ids'
import ClickOutside from '/@/components/UI/ClickOutside'
import useToggle from '/@/composables/utils/useToggle'
import ShownMessageDateMenu from './ShownMessageDateMenu.vue'
import apis from '/@/lib/apis'
import { ref } from 'vue'
import type { messageIdWithSpecifiedDate } from '/@/store/domain/messagesView'
import { useMessagesView } from '/@/store/domain/messagesView'

const props = defineProps<{
  channelId: ChannelId
  shownMessageDate: string
}>()

const { messageIdsWithSpecifiedDateMap } = useMessagesView()

const fetchMessageByDate = async (date: Date | null) => {
  const messages = (
    await apis.getMessages(
      props.channelId,
      1,
      undefined,
      date?.toISOString() ?? undefined,
      undefined,
      true,
      'asc'
    )
  ).data
  if (messages[0] === undefined) {
    return null
  }
  const messageId = messages[0].id
  return messageId
}

const messageIds = ref<messageIdWithSpecifiedDate>({
  lastWeek: null,
  lastMonth: null,
  first: null
})

const handleTogglePopupMenu = async () => {
  const messagesWithSpecifiedDate = messageIdsWithSpecifiedDateMap.value.get(
    props.channelId
  )
  if (messagesWithSpecifiedDate !== undefined) {
    messageIds.value.lastWeek = messagesWithSpecifiedDate.lastWeek
    messageIds.value.lastMonth = messagesWithSpecifiedDate.lastMonth
    messageIds.value.first = messagesWithSpecifiedDate.first
  } else {
    const date = new Date()
    const lastWeekDate = new Date()
    lastWeekDate.setDate(date.getDate() - 7)
    const lastMonthDate = new Date()
    lastMonthDate.setMonth(date.getMonth() - 1)

    messageIds.value.lastWeek = await fetchMessageByDate(lastWeekDate)
    messageIds.value.lastMonth = await fetchMessageByDate(lastMonthDate)
    messageIds.value.first = await fetchMessageByDate(null)

    messageIdsWithSpecifiedDateMap.value.set(props.channelId, {
      lastWeek: messageIds.value.lastWeek,
      lastMonth: messageIds.value.lastMonth,
      first: messageIds.value.first
    })
  }
  openPopupMenu()
}

const {
  value: isPopupMenuShown,
  open: openPopupMenu,
  close: closePopupMenu
} = useToggle(false)
</script>

<style lang="scss" module>
.container {
  position: absolute;
  inset: 12px 0 auto;
  margin: 0 auto;
  width: 152px;
  z-index: $z-index-shown-message-date;
}
.innerContainer {
  position: relative;
}
.button {
  background-color: white;
  border-radius: 24px;
  padding: 4px 16px;
  text-align: center;
  font-weight: bold;
  border: 1px solid $theme-ui-tertiary-default;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-around;
  cursor: pointer;
  &:hover {
    background-color: $theme-background-secondary-default;
  }
}
.toolsMenu {
  position: absolute;
  right: 0;
  top: 36px;
  z-index: $z-index-shown-message-date-menu;
}
</style>
