<template>
  <section>
    <new-stamp />
    <stamp-management />
  </section>
</template>

<script lang="ts" setup>
import NewStamp from '/@/components/Settings/StampTab/NewStamp.vue'
import StampManagement from '/@/components/Settings/StampTab/StampManagement.vue'
import { useStampPalettesStore } from '/@/store/entities/stampPalettes'
import { useStampsStore } from '/@/store/entities/stamps'
import { useUsersStore } from '/@/store/entities/users'

const { fetchStamps } = useStampsStore()
fetchStamps()
const { fetchStampPalettes } = useStampPalettesStore()
fetchStampPalettes()
// 所有者変更に必要
const { fetchUsers } = useUsersStore()
fetchUsers()
</script>
