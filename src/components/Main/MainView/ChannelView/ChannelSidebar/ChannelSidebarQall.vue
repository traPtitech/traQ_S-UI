<template>
  <SidebarContentContainerFoldable title="Qall">
    <ChannelSidebarMemberIcons :viewer-states="viewStates" />
  </SidebarContentContainerFoldable>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import SidebarContentContainerFoldable from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarContentContainerFoldable.vue'
import { isDefined } from '/@/lib/basic/array'
import { useUsersStore } from '/@/store/entities/users'
import type { ChannelId } from '/@/types/entity-ids'

import ChannelSidebarMemberIcons from './ChannelSidebarMemberIcons.vue'

const props = defineProps<{
  qallUserIds: ChannelId[]
}>()

const { usersMap } = useUsersStore()
const viewStates = computed(() =>
  props.qallUserIds.map(id => usersMap.value.get(id)).filter(isDefined)
)
</script>
