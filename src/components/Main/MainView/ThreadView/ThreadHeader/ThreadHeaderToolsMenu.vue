<template>
  <PrimaryViewHeaderPopupFrame
    role="menu"
    aria-label="スレッドの操作"
    @keydown.enter="selectItem"
    @keydown.space.prevent="selectItem"
  >
    <HeaderToolsMenuItem
      ref="firstItem"
      icon-name="notified-or-subscribed"
      label="通知設定"
      role="menuitem"
      tabindex="0"
      @click-item="emit('clickItem')"
    />
    <HeaderToolsMenuItem
      v-if="showSearch"
      icon-name="search"
      icon-mdi
      label="スレッド内検索"
      role="menuitem"
      tabindex="0"
      @click-item="emit('clickItem')"
    />
    <HeaderToolsMenuItem
      icon-name="link"
      icon-mdi
      label="スレッドリンクをコピー"
      role="menuitem"
      tabindex="0"
      @click-item="emit('clickItem')"
    />
    <HeaderToolsMenuItem
      icon-name="pencil"
      icon-mdi
      label="名前を変更"
      role="menuitem"
      tabindex="0"
      @click-item="emit('clickItem')"
    />
    <HeaderToolsMenuItem
      v-if="!isParentArchived"
      icon-name="archive"
      icon-mdi
      :label="isArchived ? 'アーカイブ解除' : 'アーカイブ'"
      role="menuitem"
      tabindex="0"
      @click-item="emit('clickItem')"
    />
  </PrimaryViewHeaderPopupFrame>
</template>

<script lang="ts" setup>
import { onMounted, shallowRef } from 'vue'

import PrimaryViewHeaderPopupFrame from '/@/components/Main/MainView/PrimaryViewHeader/PrimaryViewHeaderPopupFrame.vue'
import HeaderToolsMenuItem from '/@/components/Main/MainView/PrimaryViewHeader/PrimaryViewHeaderPopupMenuItem.vue'

withDefaults(
  defineProps<{
    showSearch?: boolean
    isArchived?: boolean
    isParentArchived?: boolean
  }>(),
  {
    showSearch: true,
    isArchived: false,
    isParentArchived: false
  }
)

// TODO: 各メニュー項目の処理を接続する
const emit = defineEmits<{
  (e: 'clickItem'): void
}>()

const firstItem = shallowRef<InstanceType<typeof HeaderToolsMenuItem>>()
onMounted(() => firstItem.value?.$el.focus())

const selectItem = (event: KeyboardEvent) => {
  if (event.target instanceof HTMLElement) {
    event.target.closest<HTMLElement>('[role="menuitem"]')?.click()
  }
}
</script>
