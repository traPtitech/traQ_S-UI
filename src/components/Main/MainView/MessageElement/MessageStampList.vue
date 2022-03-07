<template>
  <div v-if="stamps.length > 0" :class="$style.stampWrapper">
    <a-icon
      v-if="showDetailButton"
      name="rounded-triangle"
      :size="20"
      :class="$style.toggleButton"
      :data-is-open="$boolAttr(isDetailShown)"
      @click="toggleDetail"
    />
    <div
      ref="listEle"
      :class="$style.stampList"
      :data-show-details="$boolAttr(isDetailShown)"
    >
      <transition-group name="stamp">
        <div v-for="stamp in stampList" :key="stamp.id" :class="$style.stamp">
          <stamp-element
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
      <div
        v-if="!isDetailShown && !isArchived"
        :class="$style.stampPickerOpener"
        @click="toggleStampPicker"
      >
        <a-icon mdi name="plus" :size="20" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType, ref, Ref } from 'vue'
import { MessageStamp } from '@traptitech/traq'
import StampElement from './StampElement.vue'
import { StampId, UserId } from '/@/types/entity-ids'
import store from '/@/vuex'
import StampDetailElement from './StampDetailElement.vue'
import AIcon from '/@/components/UI/AIcon.vue'
import apis from '/@/lib/apis'
import { useStampPickerInvoker } from '/@/providers/stampPicker'
import useToastStore from '/@/providers/toastStore'

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
  const map = new Map<StampId, MessageStampById>()
  props.stamps.forEach(stamp => {
    if (!store.state.entities.stampsMap.has(stamp.stampId)) return

    if (!map.has(stamp.stampId)) {
      map.set(stamp.stampId, {
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
      })
    } else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const s = map.get(stamp.stampId)!
      s.sum += stamp.count
      s.users.push({
        id: stamp.userId,
        count: stamp.count,
        createdAt: new Date(stamp.createdAt)
      })
      if (stamp.userId === myId.value) {
        s.myCount = stamp.count
      }
      const createdAt = new Date(stamp.createdAt)
      if (createdAt < s.createdAt) {
        s.createdAt = createdAt
      }
      const updatedAt = new Date(stamp.updatedAt)
      if (s.updatedAt < updatedAt) {
        s.updatedAt = updatedAt
      }
    }
  })
  map.forEach(stamp =>
    stamp.users.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  )
  return [...map.values()].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  )
}

export default defineComponent({
  name: 'MessageStampList',
  components: { StampElement, StampDetailElement, AIcon },
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
    },
    isArchived: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const { addErrorToast } = useToastStore()
    const myId = computed(() => store.getters.domain.me.myId)
    const stampList = computed(() => createStampList(props, myId))

    const isDetailShown = ref(false)
    const toggleDetail = () => {
      isDetailShown.value = !isDetailShown.value
    }

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
    const removeStamp = async (stampId: StampId) => {
      await apis.removeMessageStamp(props.messageId, stampId)
    }

    const listEle = ref<HTMLDivElement>()
    const { toggleStampPicker } = useStampPickerInvoker(
      async stampData => {
        try {
          await apis.addMessageStamp(props.messageId, stampData.id)
        } catch {
          addErrorToast('メッセージにスタンプを追加できませんでした')
        }
      },
      listEle,
      'top-left'
    )

    return {
      stampList,
      isDetailShown,
      toggleDetail,
      addStamp,
      removeStamp,
      listEle,
      toggleStampPicker
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

.stampPickerOpener {
  display: flex;
  height: 100%;
  align-items: center;
  border: 2px solid var(--specific-stamp-picker-opener-border);
  border-radius: 4px;
  color: var(--specific-stamp-picker-opener-border);
  cursor: pointer;
}
</style>
