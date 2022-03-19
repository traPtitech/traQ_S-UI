<template>
  <main-view-header>
    <template #header>
      <main-view-header-title :class="$style.header" :title="title" />
    </template>
    <template #tools>
      <main-view-header-tools-item
        icon-mdi
        icon-name="info-outline"
        @click="openSidebar"
      />
    </template>
  </main-view-header>
</template>

<script lang="ts" setup>
import MainViewHeader from '/@/components/Main/MainView/MainViewHeader/MainViewHeader.vue'
import MainViewHeaderTitle from '/@/components/Main/MainView/MainViewHeader/MainViewHeaderTitle.vue'
import MainViewHeaderToolsItem from '/@/components/Main/MainView/MainViewHeader/MainViewHeaderToolsItem.vue'
import { computed } from 'vue'
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
