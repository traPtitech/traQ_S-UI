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
      :userIds="propst.viewerIds"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  PropType
} from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'
import UserIconEllipsisList from './UserIconEllipsisList.vue'
import { UserId } from '../../../../types/entity-ids'

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
    viewerIds: { type: Array as PropType<UserId[]>, default: [] }
  },
  components: { Icon, UserIconEllipsisList },
  setup(props, context) {
    const propst = props as { viewerIds: UserId[] }
    const styles = useStyles()
    const open = () => {
      context.emit('open')
    }
    return {
      styles,
      open,
      propst
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
