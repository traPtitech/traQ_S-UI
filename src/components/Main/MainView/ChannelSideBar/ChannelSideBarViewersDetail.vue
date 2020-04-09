<template>
  <div :class="$style.container" :style="styles.container" @click="closeDetail">
    <channel-side-bar-content title="閲覧者">
      <template #content>
        <user-icon
          v-for="id in props.viewerIds"
          :key="id"
          :userId="id"
          :class="$style.icon"
          :size="40"
        />
      </template>
    </channel-side-bar-content>
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
import ChannelSideBarContent from './ChannelSideBarContent.vue'

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
  components: { UserIcon, ChannelSideBarContent },
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
  cursor: pointer;
}

.icon {
  margin-bottom: 8px;
}
</style>
