<template>
  <user-icon-ellipsis-list
    :class="$style.container"
    direction="row"
    :userIds="viewerIds"
  />
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import UserIcon from '@/components/UI/UserIcon.vue'
import { ChannelViewState } from '@traptitech/traq'
import UserIconEllipsisList from './UserIconEllipsisList.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.primary,
      color: theme.ui.primary
    }))
  })

export default defineComponent({
  name: 'ChannelSideBarViewers',
  components: { UserIconEllipsisList },
  setup() {
    const styles = useStyles()
    const viewerIds = computed(() =>
      store.state.domain.messagesView.currentViewers
        .filter(v => v.state === ChannelViewState.Monitoring)
        .map(v => v.userId)
        .reverse()
    )
    return {
      styles,
      viewerIds
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  width: 256px;
  height: 64px;
  flex-direction: row-reverse;
  justify-content: flex-end;
  position: relative;
  border-radius: 4px;
  padding-left: 16px;
  margin-top: 16px;
  flex-shrink: 0;
}

.userIcon {
  margin-top: 12px;
  margin-right: -12px;
  border: 4px solid white;
}

.count {
  margin-left: 8px;
}
</style>
