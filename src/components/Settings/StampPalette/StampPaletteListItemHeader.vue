<template>
  <div :class="$style.container">
    <div :class="$style.name">{{ palette.name }}</div>
    <icon-button
      :class="$style.button"
      icon-name="pencil"
      icon-mdi
      @click="openStampPaletteEdit"
    />
    <icon-button
      :class="$style.button"
      icon-name="delete"
      icon-mdi
      @click="deleteStampPalette"
    />
  </div>
  <p :class="$style.description">{{ palette.description }}</p>
</template>

<script lang="ts" setup>
import type { StampPalette } from '@traptitech/traq'
import IconButton from '/@/components/UI/IconButton.vue'
import useExecWithToast from '/@/composables/toast/useExecWithToast'
import apis from '/@/lib/apis'

const { palette } = defineProps<{
  palette: StampPalette
}>()

const openStampPaletteEdit = () => {
  // TODO: implement here
}

const { execWithToast } = useExecWithToast()
const deleteStampPalette = async () => {
  if (!confirm('本当にこのスタンプパレットを削除しますか？')) return

  execWithToast(
    'スタンプパレットを削除しました',
    'スタンプパレットの削除に失敗しました',
    async () => {
      await apis.deleteStampPalette(palette.id)
    }
  )
}
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  gap: 4px;
}
.name {
  @include background-primary;
  font-size: 16px;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
  margin-right: 8px;
}
.button {
  @include color-ui-secondary;
  padding: 4px;
  border-radius: 4px;
  &:hover {
    @include background-primary;
  }
}
.description {
  @include color-ui-secondary;
}
</style>
