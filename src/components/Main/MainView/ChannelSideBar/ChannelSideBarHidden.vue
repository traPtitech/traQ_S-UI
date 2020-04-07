<template>
  <div :class="$style.container">
    <icon
      :class="$style.icon"
      mdi
      name="chevron-double"
      width="28"
      height="28"
      @click="open"
    />
    <user-icon-ellipsis-list
      direction="col"
      :max="3"
      :showCount="false"
      :userIds="props.viewersId"
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
import { UserId } from '../../../../types/entity-ids'

type Props = {
  viewersId: UserId[]
}

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
    viewersId: { type: Array, requried: true }
  },
  components: { Icon, UserIconEllipsisList },
  setup(props: Props, context: SetupContext) {
    const styles = useStyles()
    const open = () => {
      context.emit('open')
    }
    return {
      styles,
      open,
      props
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
