<template>
  <div :class="$style.container" :style="styles.container" @click="closeDetail">
    <div :class="$style.header">閲覧者</div>
    <user-icon
      v-for="id in props.viewerIds"
      :key="id"
      :userId="id"
      :class="$style.icon"
      :size="40"
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
import { makeStyles } from '@/lib/styles'
import store from '@/store'
import UserIcon from '@/components/UI/UserIcon.vue'
import { UserId } from '../../../../types/entity-ids'

type Props = {
  viewerIds: UserId[]
}
const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.primary,
      color: theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'ChannelSideBarViewerDetail',
  components: { UserIcon },
  props: { viewerIds: { type: Array, default: [] } },
  setup(props: Props, context: SetupContext) {
    const styles = useStyles()
    const closeDetail = () => {
      context.emit('close')
    }
    return { styles, props, closeDetail }
  }
})
</script>

<style lang="scss" module>
$headerSize: 1.15rem;

.container {
  display: flex;
  flex-direction: column;
  margin-top: 16px;
  width: 256px;
  border-radius: 4px;
  padding: 16px;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
}

.header {
  font-weight: bold;
  font-size: $headerSize;
  min-height: 48px;
}

.icon {
  margin-top: 8px;
}
</style>
