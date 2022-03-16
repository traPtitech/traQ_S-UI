<template>
  <div :class="$style.element">
    <h3 :class="$style.header">スタンプ編集</h3>
    <div :class="$style.content">
      <stamp-item
        v-for="stamp in myStamps"
        :key="stamp.id"
        :stamp="stamp"
        :is-selected="stamp.id === selectedStampId"
        @start-edit="selectStamp(stamp.id)"
        @end-edit="unselectStamp"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import StampItem from './StampItem.vue'
import { computed, ref } from 'vue'
import { StampId } from '/@/types/entity-ids'
import { useMeStore } from '/@/store/domain/me'
import { useStampsStore } from '/@/store/entities/stamps'

const { myId } = useMeStore()
const { stampsMap } = useStampsStore()

// TODO: 管理者なら全部変えられるたぶん https://github.com/traPtitech/traQ_S-UI/issues/291

const myStamps = computed(() =>
  [...stampsMap.value.values()].filter(stamp => stamp.creatorId === myId.value)
)

const selectedStampId = ref<StampId | null>()
const selectStamp = (id: StampId) => {
  selectedStampId.value = id
}
const unselectStamp = () => {
  selectedStampId.value = null
}
</script>

<style lang="scss" module>
.header {
  margin-bottom: 8px;
}
.element {
  margin: 24px 0;
}
.content {
  margin-left: 12px;
}
</style>
