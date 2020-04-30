<template>
  <div :class="$style.container" :style="styles.container">
    <div :class="$style.channelPath">
      {{ channelPath }}
    </div>
    <div :class="$style.userName" :style="styles.userName">
      {{ userName }}
    </div>
    <div :class="$style.createdAt" :style="styles.createdAt">
      {{ createdAt }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import useFileMeta from '@/use/fileMeta'
import useChannelPath from '@/use/channelPath'
import { getCreatedDate } from '@/lib/date'

const useStyles = (props: { isWhite: boolean }) =>
  reactive({
    container: makeStyles((theme, common) => ({
      color: props.isWhite ? common.text.whitePrimary : theme.ui.primary
    })),
    userName: makeStyles((theme, common) => ({
      color: props.isWhite ? common.text.whiteSecondary : theme.ui.secondary
    })),
    createdAt: makeStyles((theme, common) => ({
      color: props.isWhite ? common.text.whiteSecondary : theme.ui.secondary
    }))
  })

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
    const styles = useStyles(props)
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
    return { styles, channelPath, userName, createdAt }
  }
})
</script>

<style lang="scss" module>
.container {
  display: grid;
  width: 100%;
  grid-template:
    'channelPath ... ...' 20px
    'userName ... createdAt' 16px
    / auto 1fr auto;
  gap: 4px 0;
  padding: 12px 16px;
}
.channelPath {
  grid-area: channelPath;
  display: flex;
  align-items: center;
}
.userName {
  grid-area: userName;
  display: flex;
  align-items: center;
}
.createdAt {
  grid-area: createdAt;
  display: flex;
  align-items: center;
}
</style>
