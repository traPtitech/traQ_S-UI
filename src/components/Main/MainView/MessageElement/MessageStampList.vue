<template>
  <div :class="$style.stampList" :data-show-details="isShowDetail">
    <div v-for="stamp in stampList" :key="stamp.id" :class="$style.stamp">
      <stamp-element
        :class="$style.element"
        :stamp="stamp"
        @add-stamp="addStamp"
        @remove-stamp="removeStamp"
      />
      <stamp-detail-element
        v-if="props.isShowDetail"
        :class="$style.detail"
        :stamp="stamp"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from '@vue/composition-api'
import { MessageStamp } from '@traptitech/traq'
import StampElement from './StampElement.vue'
import { StampId, UserId } from '@/types/entity-ids'
import store from '@/store'
import StampDetailElement from './StampDetailElement.vue'
import Icon from '@/components/UI/Icon.vue'

/**
 * StampIdで整理されたMessageStamp
 */
export interface MessageStampById {
  /**
   * スタンプID
   */
  id: StampId
  /**
   * 押した数の累計
   */
  sum: number
  /**
   * ユーザーとそのユーザーの押した数
   */
  users: Array<{ id: UserId; count: number }>
  /**
   * 一番最初に押された時間
   */
  createdAt: Date
  /**
   * 一番最後に押された時間
   */
  updatedAt: Date
}

const createStampList = (props: { stamps: MessageStamp[] }) => {
  const map: Record<StampId, MessageStampById> = {}
  props.stamps.forEach(stamp => {
    const { stampId } = stamp
    if (!map[stamp.stampId]) {
      map[stampId] = {
        id: stamp.stampId,
        sum: stamp.count,
        users: [{ id: stamp.userId, count: stamp.count }],
        createdAt: new Date(stamp.createdAt),
        updatedAt: new Date(stamp.updatedAt)
      }
    } else {
      map[stampId].sum += stamp.count
      map[stampId].users.push({ id: stamp.userId, count: stamp.count })
      const createdAt = new Date(stamp.createdAt)
      if (createdAt < map[stampId].createdAt) {
        map[stampId].createdAt = createdAt
      }
      const updatedAt = new Date(stamp.updatedAt)
      if (map[stampId].updatedAt < updatedAt) {
        map[stampId].updatedAt = updatedAt
      }
    }
  })
  return Object.values(map).sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  )
}

export default defineComponent({
  name: 'MessageStampList',
  props: {
    stamps: {
      type: Array as PropType<MessageStamp[]>,
      required: true
    },
    messageId: {
      type: String,
      required: true
    },
    isShowDetail: {
      type: Boolean,
      required: true
    }
  },
  components: { StampElement, StampDetailElement, Icon },
  setup(props) {
    const stampList = computed(() => createStampList(props))
    const addStamp = (stampId: StampId) => {
      store.dispatch.domain.messagesView.addStamp({
        messageId: props.messageId,
        stampId
      })
    }
    const removeStamp = (stampId: StampId) => {
      store.dispatch.domain.messagesView.removeStamp({
        messageId: props.messageId,
        stampId
      })
    }
    return {
      props,
      stampList,
      addStamp,
      removeStamp
    }
  }
})
</script>

<style lang="scss" module>
.toggle {
  margin-right: 4px;
}
.stampList {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  &[data-show-details] {
    flex-direction: column;
  }
  contain: content;
}
.stamp {
  margin: {
    right: 4px;
    bottom: 4px;
  }

  display: flex;
}
.detail {
  margin-left: 4px;
}
</style>
