<template>
  <div :class="$style.container" :data-is-white="$boolAttr(isWhite)">
    <div :class="$style.channelPath" @mousedown="onClick">
      {{ channelPath }}
    </div>
    <file-modal-content-footer-username
      :class="$style.userName"
      :user-id="user?.id"
    />
    <div :class="$style.createdAt">{{ createdAt }}</div>
  </div>
</template>

<script lang="ts" setup>
import FileModalContentFooterUsername from './FileModalContentFooterUsername.vue'
import { computed } from 'vue'
import useFileMeta from '/@/composables/files/useFileMeta'
import useChannelPath from '/@/composables/useChannelPath'
import { getDateRepresentation } from '/@/lib/basic/date'
import { useOpenLinkAndClearModal } from '../composables/useOpenLinkFromModal'
import { useUsersStore } from '/@/store/entities/users'

const props = withDefaults(
  defineProps<{
    fileId: string
    isWhite?: boolean
  }>(),
  {
    isWhite: false
  }
)

const { usersMap } = useUsersStore()

const { fileMeta } = useFileMeta(props)
const { openLinkAndClearModal } = useOpenLinkAndClearModal()

const user = computed(() =>
  usersMap.value.get(fileMeta.value?.uploaderId ?? '')
)
const createdAt = computed(() =>
  getDateRepresentation(fileMeta.value?.createdAt ?? '')
)

const { channelIdToPathString, channelIdToLink } = useChannelPath()
const channelPath = computed(() => {
  try {
    return fileMeta.value?.channelId
      ? channelIdToPathString(fileMeta.value?.channelId, true)
      : ''
  } catch {
    return ''
  }
})
const channelLink = computed(() => {
  try {
    return fileMeta.value?.channelId
      ? channelIdToLink(fileMeta.value?.channelId)
      : ''
  } catch {
    return ''
  }
})

const onClick = async (event: MouseEvent) => {
  if (channelLink.value === '') return

  openLinkAndClearModal(event, channelLink.value)
}
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  display: grid;
  width: 100%;
  grid-template:
    'channelPath ... ...' 20px
    'userName ... createdAt' 16px
    / auto 1fr auto;
  gap: 4px 0;
  padding: 12px 16px;
  &[data-is-white] {
    @include color-common-text-white-primary;
  }
}
.channelPath {
  @include size-body1;
  grid-area: channelPath;
  display: flex;
  align-items: center;
  cursor: pointer;
}
.userName {
  @include color-ui-secondary;
  @include size-body2;
  grid-area: userName;
  display: flex;
  align-items: center;
  .container[data-is-white] & {
    @include color-common-text-white-secondary;
  }
}
.createdAt {
  @include color-ui-secondary;
  grid-area: createdAt;
  display: flex;
  align-items: center;
  .container[data-is-white] & {
    @include color-common-text-white-secondary;
  }
}
</style>
