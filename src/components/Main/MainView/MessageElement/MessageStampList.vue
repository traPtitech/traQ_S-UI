<template>
  <div v-if="stamps.length > 0" :class="$style.stampWrapper">
    <icon
      v-if="showDetailButton"
      name="rounded-triangle"
      :size="20"
      :class="$style.toggleButton"
      :data-is-open="isDetailShown"
      @click="toggleDetail"
    />
    <transition-group
      name="stamp"
      tag="div"
      :class="$style.stampList"
      :data-show-details="isDetailShown"
    >
      <div v-for="stamp in stampList" :key="stamp.id" :class="$style.stamp">
        <stamp-element
          :class="$style.element"
          :stamp="stamp"
          @add-stamp="addStamp"
          @remove-stamp="removeStamp"
        />
        <stamp-detail-element
          v-if="isDetailShown"
          :class="$style.detail"
          :stamp="stamp"
        />
      </div>
    </transition-group>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType, ref, Ref } from 'vue'
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
   * 自分の押した数
   */
  myCount: number
  /**
   * ユーザー、そのユーザーの押した数と最初に押した時間
   */
  users: Array<{ id: UserId; count: number; createdAt: Date }>
  /**
   * 一番最初に押された時間
   */
  createdAt: Date
  /**
   * 一番最後に押された時間
   */
  updatedAt: Date
}

const createStampList = (
  props: { stamps: MessageStamp[] },
  myId: Ref<UserId | undefined>
) => {
  const map: Record<StampId, MessageStampById> = {}
  props.stamps.forEach(stamp => {
    const { stampId } = stamp
    if (!store.state.entities.stamps[stampId]) return

    if (!map[stamp.stampId]) {
      map[stampId] = {
        id: stamp.stampId,
        sum: stamp.count,
        myCount: stamp.userId === myId.value ? stamp.count : 0,
        users: [
          {
            id: stamp.userId,
            count: stamp.count,
            createdAt: new Date(stamp.createdAt)
          }
        ],
        createdAt: new Date(stamp.createdAt),
        updatedAt: new Date(stamp.updatedAt)
      }
    } else {
      map[stampId].sum += stamp.count
      map[stampId].users.push({
        id: stamp.userId,
        count: stamp.count,
        createdAt: new Date(stamp.createdAt)
      })
      if (stamp.userId === myId.value) {
        map[stampId].myCount = stamp.count
      }
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
  Object.values(map).forEach(stamp =>
    stamp.users.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  )
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
    showDetailButton: {
      type: Boolean,
      default: false
    }
  },
  components: { StampElement, StampDetailElement, Icon },
  setup(props) {
    const myId = computed(() => store.state.domain.me.detail?.id)
    const stampList = computed(() => createStampList(props, myId))

    const isDetailShown = ref(false)
    const toggleDetail = () => {
      isDetailShown.value = !isDetailShown.value
    }

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
      stampList,
      isDetailShown,
      toggleDetail,
      addStamp,
      removeStamp
    }
  }
})
</script>

<style lang="scss" module>
.stampWrapper {
  position: relative;
  margin-top: 8px;
  margin-left: 42px;
}

.toggleButton {
  @include color-ui-secondary;
  position: absolute;
  left: -26px;
  top: 2px;
  cursor: pointer;

  transform: rotate(0turn);
  &[data-is-open] {
    transform: rotate(-0.5turn);
  }
  transition: transform 0.5s;
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
