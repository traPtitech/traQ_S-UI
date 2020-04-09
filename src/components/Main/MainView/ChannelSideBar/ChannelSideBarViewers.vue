<template>
  <div
    v-if="!state.isOpenDetail"
    :class="$style.container"
    :style="styles.container"
    @click="toggle"
  >
    <user-icon-ellipsis-list direction="row" :userIds="props.viewersId" />
  </div>
  <channel-side-bar-viewers-detail
    v-else
    :viewerIds="props.viewersId"
    @close="toggle"
  />
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  watchEffect,
  ref
} from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import UserIconEllipsisList from './UserIconEllipsisList.vue'
import ChannelSideBarViewersDetail from './ChannelSideBarViewersDetail.vue'
import { UserId } from '../../../../types/entity-ids'

type Props = {
  viewersId: UserId[]
}

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.primary,
      color: theme.ui.primary
    }))
  })

export default defineComponent({
  name: 'ChannelSideBarViewers',
  components: { UserIconEllipsisList, ChannelSideBarViewersDetail },
  props: {
    viewersId: { type: Array, required: true }
  },
  setup(props: Props) {
    const styles = useStyles()
    const state = reactive({
      isOpenDetail: false
    })
    const toggle = () => {
      state.isOpenDetail = !state.isOpenDetail
    }
    return { styles, props, state, toggle }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  width: 256px;
  height: 64px;
  border-radius: 4px;
  padding-left: 16px;
  flex-shrink: 0;
  cursor: pointer;
}
</style>
