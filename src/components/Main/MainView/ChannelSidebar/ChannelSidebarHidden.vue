<template>
  <div :class="$style.container" :style="styles.container">
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
      show-count
      :user-ids="viewerIds"
      :style="styles.rest"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'
import UserIconEllipsisList from '@/components/UI/UserIconEllipsisList.vue'
import { UserId } from '@/types/entity-ids'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.primary
    })),
    rest: makeStyles(theme => ({
      color: theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'ChannelSidebarHidden',
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
