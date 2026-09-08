<template>
  <div>
    <StampPaletteList v-if="isPathStampPalette" />
    <router-view />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import StampPaletteList from '/@/components/Settings/StampPaletteTab/StampPaletteList.vue'
import { settingsStampPaletteRouteName } from '/@/router/settings'
import { useChannelsStore } from '/@/store/entities/channels'
import { useGroupsStore } from '/@/store/entities/groups'
import { useStampPalettesStore } from '/@/store/entities/stampPalettes'
import { useStampsStore } from '/@/store/entities/stamps'
import { useUsersStore } from '/@/store/entities/users'

const route = useRoute()
const isPathStampPalette = computed(
  () => route.name === settingsStampPaletteRouteName
)

const { fetchStamps } = useStampsStore()
fetchStamps()
const { fetchStampPalettes } = useStampPalettesStore()
fetchStampPalettes()
// 説明のレンダリングに必要
const { fetchChannels } = useChannelsStore()
fetchChannels()
const { fetchUsers } = useUsersStore()
fetchUsers()
const { fetchUserGroups } = useGroupsStore()
fetchUserGroups()
</script>

<style lang="scss" module></style>
