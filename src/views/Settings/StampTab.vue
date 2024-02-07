<template>
  <section>
    <new-stamp />
    <stamp-management />
    <div :class="$style.element">
      <h3 :class="$style.header">スタンプパレット</h3>
      <p :class="$style.content">実装予定</p>
    </div>
  </section>
</template>

<script lang="ts" setup>
import NewStamp from '/@/components/Settings/StampTab/NewStamp.vue'
import StampManagement from '/@/components/Settings/StampTab/StampManagement.vue'
import { useStampsStore } from '/@/store/entities/stamps'
import { useStampPalettesStore } from '/@/store/entities/stampPalettes'
import { useUsersStore } from '/@/store/entities/users'

const { fetchStamps } = useStampsStore()
fetchStamps()
const { fetchStampPalettes } = useStampPalettesStore()
fetchStampPalettes()
// 所有者変更に必要
const { fetchUsers } = useUsersStore()
fetchUsers()
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
