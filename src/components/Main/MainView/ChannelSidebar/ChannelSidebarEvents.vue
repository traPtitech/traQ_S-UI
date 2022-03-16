<template>
  <sidebar-content-container-link title="イベント" @click-link="onClickLink" />
</template>

<script lang="ts" setup>
import SidebarContentContainerLink from '/@/components/Main/MainView/MainViewSidebar/SidebarContentContainerLink.vue'

const emit = defineEmits<{
  (e: 'clickLink'): void
}>()

const onClickLink = () => {
  emit('clickLink')
}
</script>
