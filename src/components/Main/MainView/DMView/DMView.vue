<template>
  <div :class="$style.container" :style="styles.container">
    <channel-view-content :channel-id="channelId" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'
import { makeStyles } from '@/lib/styles'
import ChannelViewContent from '@/components/Main/MainView/ChannelView/ChannelViewContent.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.primary,
      color: theme.ui.primary
    }))
  })

export default defineComponent({
  name: 'DMView',
  props: {
    channelId: { type: String as PropType<ChannelId>, required: true }
  },
  components: { ChannelViewContent },
  setup() {
    const styles = useStyles()

    return {
      styles
    }
  }
})
</script>

<style lang="scss" module>
.container {
  width: 100%;
  height: 100%;
}
</style>
