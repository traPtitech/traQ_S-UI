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
            :is-detail-shown="isDetailShown"
            :is-archived="isArchived"
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

<script lang="ts" setup>
import { computed, ref } from 'vue'
import type { MessageStamp } from '@traptitech/traq'
import type { StampId } from '/@/types/entity-ids'
import { useStampPickerInvoker } from '/@/store/ui/stampPicker'
import { useMeStore } from '/@/store/domain/me'
import { useStampsStore } from '/@/store/entities/stamps'
import StampElement from './StampElement.vue'
import StampDetailElement from './StampDetailElement.vue'
import AIcon from '/@/components/UI/AIcon.vue'
import useToggle from '/@/composables/utils/useToggle'
import { createStampList } from '/@/lib/messageStampList'
import { useStampUpdater } from '/@/lib/updater/stamp'

const props = withDefaults(
  defineProps<{
    stamps: MessageStamp[]
    messageId: string
    showDetailButton?: boolean
    isArchived?: boolean
  }>(),
  {
    showDetailButton: false,
    isArchived: false
  }
)

const { myId } = useMeStore()
const { stampsMap } = useStampsStore()
const { addStampOptimistically, removeStampOptimistically } = useStampUpdater()
const stampList = computed(() => createStampList(props.stamps, myId.value))

const { value: isDetailShown, toggle: toggleDetail } = useToggle(false)

const addStamp = (stampId: StampId) =>
  addStampOptimistically(props.messageId, stampId)
const removeStamp = (stampId: StampId) =>
  removeStampOptimistically(props.messageId, stampId)

const listEle = ref<HTMLDivElement>()
const { toggleStampPicker } = useStampPickerInvoker(
  async stampData => addStampOptimistically(props.messageId, stampData.id),
  listEle,
  false,
  'top-left'
)
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
    right: 0.25rem;
    bottom: 0.25rem;
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
