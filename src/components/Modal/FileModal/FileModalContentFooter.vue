<template>
  <div :class="$style.container" :data-is-white="$boolAttr(isWhite)">
    <div :class="$style.channelPath" @click="onClick">{{ channelPath }}</div>
    <file-modal-content-footer-username
      :class="$style.userName"
      :user-id="user?.id"
    />
    <div :class="$style.createdAt">{{ createdAt }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import store from '@/store'
import useFileMeta from '@/use/fileMeta'
import useChannelPath from '@/use/channelPath'
import FileModalContentFooterUsername from './FileModalContentFooterUsername.vue'
import { getCreatedDate } from '@/lib/date'
import { useRouter } from 'vue-router'

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
    const router = useRouter()
    const { fileMeta } = useFileMeta(props)
    const user = computed(() =>
      store.state.entities.usersMap.get(fileMeta.value?.uploaderId ?? '')
    )
    const createdAt = computed(() =>
      getCreatedDate(fileMeta.value?.createdAt ?? '')
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

    const onClick = async () => {
      if (channelLink.value === '') return
      const pathCache = channelLink.value
      await store.dispatch.ui.modal.clearModal()
      router.push(pathCache)
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
