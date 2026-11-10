<template>
  <section>
    <ProfileHeader text="所属班" />
    <template v-if="teamGroups.length === 0">
      所属している班はありません
    </template>
    <div v-else :class="$style.container">
      <GroupIcon
        v-for="team in teamGroups"
        :key="team.id"
        :group-id="team.id"
        :size="32"
      />
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import GroupIcon from '/@/components/UI/GroupIcon.vue'
import { useGroupsStore } from '/@/store/entities/groups'

import ProfileHeader from './ProfileHeader.vue'

const props = defineProps<{
  userId: string
}>()

const { getTeamGroupsByUserId } = useGroupsStore()
const teamGroups = computed(() => getTeamGroupsByUserId(props.userId))
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
</style>
