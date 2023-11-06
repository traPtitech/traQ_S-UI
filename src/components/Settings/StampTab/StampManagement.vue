<template>
  <div :class="$style.element">
    <h3 :class="$style.header">スタンプ管理</h3>
    <div :class="$style.content">
      <stamp-item
        v-for="stamp in myStamps"
        :key="stamp.id"
        :stamp="stamp"
        @start-edit="selectStamp(stamp.id)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import StampItem from './StampItem.vue'
import { computed } from 'vue'
import type { StampId } from '/@/types/entity-ids'
import { useMeStore } from '/@/store/domain/me'
import { useStampsStore } from '/@/store/entities/stamps'
import { useModalStore } from '/@/store/ui/modal'

const { myId } = useMeStore()
const { stampsMap } = useStampsStore()
const { pushModal } = useModalStore()

// TODO: 管理者なら全部変えられるたぶん https://github.com/traPtitech/traQ_S-UI/issues/291

const myStamps = computed(() =>
  [...stampsMap.value.values()].filter(stamp => stamp.creatorId === myId.value)
)

const selectStamp = (id: StampId) => {
  pushModal({
    type: 'settings-stamp-edit',
    id
  })
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
