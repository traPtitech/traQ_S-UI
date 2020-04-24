<template>
  <main-view-header>
    <template #header>
      <main-view-header-title
        :title="clipFolderName"
        icon-mdi
        icon-name="bookmark"
      />
    </template>
    <template #tools>
      <!-- TODO: クリップフォルダの編集 -->
    </template>
  </main-view-header>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  PropType,
  computed
} from '@vue/composition-api'
import store from '@/store'
import { ClipFolderId } from '@/types/entity-ids'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'
import MainViewHeader from '@/components/Main/MainView/MainViewHeader/MainViewHeader.vue'
import MainViewHeaderTitle from '@/components/Main/MainView/MainViewHeader/MainViewHeaderTitle.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.primary,
      color: theme.ui.primary,
      borderBottom: `2px solid ${theme.ui.tertiary}`
    })),
    navigationButton: makeStyles(theme => ({
      color: theme.ui.primary
    }))
  })

export default defineComponent({
  name: 'ChannelViewHeader',
  components: {
    Icon,
    MainViewHeader,
    MainViewHeaderTitle
  },
  props: {
    clipFolderId: {
      type: String as PropType<ClipFolderId>,
      required: true
    }
  },
  setup(props, context) {
    const styles = useStyles()
    const clipFolderName = computed(
      () => store.state.entities.clipFolders[props.clipFolderId]?.name ?? ''
    )
    return {
      styles,
      clipFolderName
    }
  }
})
</script>
