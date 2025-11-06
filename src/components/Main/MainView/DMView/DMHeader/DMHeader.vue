<template>
  <PrimaryViewHeader>
    <template #header>
      <PrimaryViewHeaderTitle :class="$style.header" :title="title" />
    </template>
    <template #tools>
      <PrimaryViewHeaderToolsItem
        icon-mdi
        icon-name="info-outline"
        @click="openSidebar"
      />
    </template>
  </PrimaryViewHeader>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import PrimaryViewHeader from '/@/components/Main/MainView/PrimaryViewHeader/PrimaryViewHeader.vue'
import PrimaryViewHeaderTitle from '/@/components/Main/MainView/PrimaryViewHeader/PrimaryViewHeaderTitle.vue'
import PrimaryViewHeaderToolsItem from '/@/components/Main/MainView/PrimaryViewHeader/PrimaryViewHeaderToolsItem.vue'
import useSidebar from '/@/composables/mainView/useSidebar'

const props = defineProps<{
  userName: string
}>()

const { openSidebar } = useSidebar()
const title = computed(() => `@ ${props.userName}`)
</script>

<style lang="scss" module>
.header {
  overflow-x: auto;
  word-break: keep-all;
  white-space: nowrap;
}
</style>
