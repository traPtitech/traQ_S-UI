<template>
  <div :class="$style.container">
    <div :class="$style.name">
      {{ palette.name }}
    </div>
    <router-link
      :class="$style.link"
      :to="constructSettingsStampPaletteDetailPath(palette.id)"
    >
      <a-icon mdi name="pencil" />
    </router-link>
    <icon-button
      :class="$style.icon"
      icon-name="delete"
      icon-mdi
      @click="showStampPaletteDeleteToast"
    />
  </div>
  <p :class="$style.description">
    {{ palette.description }}
  </p>
</template>

<script lang="ts" setup>
import type { StampPalette } from '@traptitech/traq'
import AIcon from '/@/components/UI/AIcon.vue'
import IconButton from '/@/components/UI/IconButton.vue'
import useExecWithToast from '/@/composables/toast/useExecWithToast'
import { constructSettingsStampPaletteDetailPath } from '/@/router/settingsStampPalette'
import { useStampPalettesStore } from '/@/store/entities/stampPalettes'

const { palette } = defineProps<{
  palette: StampPalette
}>()

const { deleteStampPalette } = useStampPalettesStore()
const { execWithToast } = useExecWithToast()
const showStampPaletteDeleteToast = async () => {
  if (!confirm('本当にこのスタンプパレットを削除しますか？')) return

  execWithToast(
    'スタンプパレットを削除しました',
    'スタンプパレットの削除に失敗しました',
    async () => await deleteStampPalette(palette.id)
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
  @include size-body1;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
  margin-right: 8px;
}
.link {
  @include color-ui-secondary;
  display: flex;
  padding: 4px;
  border-radius: 4px;
  &:hover {
    @include background-primary;
  }
}
.icon {
  @include color-ui-secondary;
  padding: 4px;
  border-radius: 4px;
  &:hover {
    @include background-primary;
  }
}
.description {
  @include color-ui-secondary;
  @include size-body2;
  white-space: pre-wrap;
}
</style>
