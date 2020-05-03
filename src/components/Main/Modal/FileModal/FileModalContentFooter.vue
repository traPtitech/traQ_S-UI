<template>
  <div :class="$style.container" :data-is-white="isWhite">
    <div :class="$style.channelPath">
      {{ channelPath }}
    </div>
    <div :class="$style.userName">
      {{ userName }}
    </div>
    <div :class="$style.createdAt">
      {{ createdAt }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import store from '@/store'
import useFileMeta from '@/use/fileMeta'
import useChannelPath from '@/use/channelPath'
import { getCreatedDate } from '@/lib/date'

export default defineComponent({
  name: 'FileModalContentFooter',
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

    let channelPath = ''
    try {
      channelPath = useChannelPath().channelIdToPathString(
        fileMeta.value?.channelId ?? '',
        true
      )
    } catch {}
    const user = store.state.entities.users[fileMeta.value?.uploaderId ?? '']
    const userName = '@' + user?.name
    const createdAt = getCreatedDate(fileMeta.value?.createdAt ?? '')
    return { channelPath, userName, createdAt }
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
