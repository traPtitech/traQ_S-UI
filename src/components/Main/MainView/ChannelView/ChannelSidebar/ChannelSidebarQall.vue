<template>
  <SidebarContentContainerFoldable title="Qall">
    <ChannelSidebarMemberIcons :viewer-states="viewStates" />
  </SidebarContentContainerFoldable>
</template>

<script lang="ts" setup>
import SidebarContentContainerFoldable from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarContentContainerFoldable.vue'
import ChannelSidebarMemberIcons from './ChannelSidebarMemberIcons.vue'
import { computed } from 'vue'
import type { ChannelId } from '/@/types/entity-ids'
import { useUsersStore } from '/@/store/entities/users'
import { isDefined } from '/@/lib/basic/array'

const props = defineProps<{
  qallUserIds: ChannelId[]
}>()

const { usersMap } = useUsersStore()
const viewStates = computed(() =>
  props.qallUserIds.map(id => usersMap.value.get(id)).filter(isDefined)
)
</script>
