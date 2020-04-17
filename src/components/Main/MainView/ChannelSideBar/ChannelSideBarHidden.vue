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
      :show-count="false"
      :user-ids="viewerIds"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'
import UserIconEllipsisList from './UserIconEllipsisList.vue'
import { UserId } from '@/types/entity-ids'

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
    const styles = useStyles()
    const open = () => {
      context.emit('open')
    }
    return {
      styles,
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
  align-items: center;
}

.icon {
  margin-bottom: 16px;
  margin-top: 16px;
  cursor: pointer;
}
</style>
