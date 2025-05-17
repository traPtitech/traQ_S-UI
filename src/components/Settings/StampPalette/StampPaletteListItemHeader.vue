<template>
  <div :class="$style.container">
    <div :class="$style.name">{{ palette.name }}</div>
    <router-link
      :class="$style.link"
      :to="constructSettingsStampPaletteEditPath(palette.id)"
    >
      <a-icon mdi name="pencil" />
    </router-link>
    <icon-button
      :class="$style.icon"
      icon-name="delete"
      icon-mdi
      @click="deleteStampPalette"
    />
  </div>
  <p :class="$style.description">{{ palette.description }}</p>
</template>

<script lang="ts" setup>
import type { StampPalette } from '@traptitech/traq'
import AIcon from '/@/components/UI/AIcon.vue'
import IconButton from '/@/components/UI/IconButton.vue'
import useExecWithToast from '/@/composables/toast/useExecWithToast'
import apis from '/@/lib/apis'
import { constructSettingsStampPaletteEditPath } from '/@/router/settingsStampPalette'

const { palette } = defineProps<{
  palette: StampPalette
}>()

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
}
</style>
