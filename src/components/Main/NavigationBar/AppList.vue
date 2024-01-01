<template>
  <click-outside stop @click-outside="close">
    <div :class="$style.container">
      <div :class="$style.header">
        <span :class="$style.title">サービス</span>
        <close-button
          :class="$style.close"
          :size="32"
          :border-width="2"
          @close="close"
        />
      </div>
      <div :class="$style.list">
        <app-list-item
          v-for="app in apps"
          :key="app.label"
          :icon-path="app.iconPath"
          :label="app.label"
          :app-link="app.appLink"
        />
      </div>
    </div>
  </click-outside>
</template>

<script lang="ts" setup>
import AppListItem from '/@/components/Main/NavigationBar/AppListItem.vue'
import ClickOutside from '/@/components/UI/ClickOutside'
import CloseButton from '/@/components/UI/CloseButton.vue'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const apps = window.traQConfig.services ?? []

const close = () => {
  emit('close')
}
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  @include background-primary;
  @include drop-shadow-default;
  display: flex;
  flex-direction: column;
  padding: 16px;
  border-radius: 8px;
}

.header {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
}

.title {
  font-weight: bold;
}

.close {
  margin-left: auto;
}

.list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;

  overflow: {
    x: hidden;
    y: auto;
  }

  scrollbar-gutter: stable;
}
</style>
