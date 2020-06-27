<template>
  <div :class="$style.container" data-is-white="isWhite">
    <div :class="[$style.channelPath]" @click="onClick">#{{ channelPath }}</div>
    <div :class="$style.userName">
      <file-modal-content-footer-username :user-id="user.id" />
    </div>
    <div :class="$style.createdAt">{{ createdAt }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'

import store from '@/store'
import useFileMeta from '@/use/fileMeta'
import useChannelPath from '@/use/channelPath'
import FileModalContentFooterUsername from './FileModalContentFooterUsername.vue'
import { getCreatedDate } from '@/lib/date'
import { changeChannelByPath } from '@/router/channel'

export default defineComponent({
  name: 'FileModalContentFooter',
  components: {
    FileModalContentFooterUsername
  },
  props: {
    fileId: {
      type: String,
      required: true
    },
    isWhite: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const { fileMeta } = useFileMeta(props, context)
    const user = store.state.entities.users[fileMeta.value?.uploaderId ?? '']
    const createdAt = getCreatedDate(fileMeta.value?.createdAt ?? '')
    const { channelIdToPathString } = useChannelPath()
    const channelPath = computed(() =>
      fileMeta.value?.channelId
        ? channelIdToPathString(fileMeta.value?.channelId)
        : ''
    )
    const onClick = async () => {
      if (!fileMeta.value?.channelId) return
      const pathCache = channelPath.value
      await store.dispatch.ui.modal.clearModal()
      changeChannelByPath(pathCache)
    }

    return { channelPath, createdAt, user, onClick }
  }
})
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
  grid-area: channelPath;
  display: flex;
  align-items: center;
  cursor: pointer;
}
.userName {
  @include color-ui-secondary;
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
