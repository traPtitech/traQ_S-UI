<template>
  <div :class="$style.container">
    <div :class="$style.name">
      {{ palette.name }}
    </div>
    <router-link
      :class="$style.link"
      :to="constructSettingsStampPaletteDetailPath(palette.id)"
    >
      <AIcon mdi name="pencil" />
    </router-link>
    <IconButton
      :class="$style.icon"
      icon-name="delete"
      icon-mdi
      @click="showStampPaletteDeleteToast"
    />
  </div>
  <MarkdownPreview
    :class="$style.description"
    :content="palette.description"
    accept-action
  />
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'
import IconButton from '/@/components/UI/IconButton.vue'
import MarkdownPreview from '/@/components/UI/MarkdownPreview.vue'
import useExecWithToast from '/@/composables/toast/useExecWithToast'
import { constructSettingsStampPaletteDetailPath } from '/@/router/settingsStampPalette'
import { useChannelsStore } from '/@/store/entities/channels'
import { useGroupsStore } from '/@/store/entities/groups'
import { useStampPalettesStore } from '/@/store/entities/stampPalettes'
import { useUsersStore } from '/@/store/entities/users'
import type { StampPalette } from '/@/types/entity'

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

// 説明のレンダリングに必要
const { fetchChannels } = useChannelsStore()
fetchChannels()
const { fetchUsers } = useUsersStore()
fetchUsers()
const { fetchUserGroups } = useGroupsStore()
fetchUserGroups()
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
}
</style>
