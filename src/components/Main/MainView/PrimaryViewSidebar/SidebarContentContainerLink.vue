<template>
  <sidebar-content-container
    clickable
    :title="title"
    :large-padding="largePadding"
    @toggle="emit('clickLink')"
  >
    <template #header-control>
      <div>
        <span v-if="count !== undefined" :class="$style.count">{{
          count
        }}</span>
        <a-icon name="chevron-right" :class="$style.icon" mdi />
      </div>
    </template>
    <template #default />
  </sidebar-content-container>
</template>

<script lang="ts" setup>
import SidebarContentContainer from '/@/components/Main/MainView/PrimaryViewSidebar/SidebarContentContainer.vue'
import AIcon from '/@/components/UI/AIcon.vue'

withDefaults(
  defineProps<{
    title?: string
    count?: number
    largePadding?: boolean
  }>(),
  {
    largePadding: false
  }
)

const emit = defineEmits<{
  (e: 'clickLink'): void
}>()
</script>

<style lang="scss" module>
.count {
  font-weight: normal;
}
.icon {
  margin-left: 4px;
  vertical-align: bottom;
}
</style>
