<template>
  <div :class="$style.container">
    <icon
      :class="$style.icon"
      mdi
      name="chevronDouble"
      width="28"
      height="28"
      @click="open"
    />
    <user-icon-ellipsis-list
      direction="col"
      max="3"
      :showCount="false"
      :userIds="viewersId"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  SetupContext
} from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'
import UserIconEllipsisList from './UserIconEllipsisList.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.secondary,
      color: theme.ui.primary
    }))
  })

export default defineComponent({
  name: 'ChannelSideBarHidden',
  props: {
    channelId: { type: String, requried: true }
  },
  components: { Icon, UserIconEllipsisList },
  setup(_, context: SetupContext) {
    const styles = useStyles()
    const viewersId = computed(
      () => store.state.domain.messagesView.currentViewers
    )
    const open = () => {
      context.emit('open')
    }
    return {
      styles,
      viewersId,
      open
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
  width: 56px;
  height: 100%;
  overflow: scroll;
  align-items: center;
}

.icon {
  margin-bottom: 16px;
  margin-top: 16px;
}
</style>
