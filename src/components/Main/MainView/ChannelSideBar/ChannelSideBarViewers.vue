<template>
  <user-icon-ellipsis-list
    :class="$style.container"
    :style="styles.container"
    direction="row"
    :userIds="props.viewersId"
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
  components: { UserIconEllipsisList },
  props: { viewersId: { type: Array, required: true } },
  setup(props: Props) {
    const styles = useStyles()
    const state = reactive({
      isOpenDetail: false
    })
    return {
      styles,
      props
    }
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
  margin-top: 16px;
  flex-shrink: 0;
}
</style>
