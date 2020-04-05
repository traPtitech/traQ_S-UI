<template>
  <div :class="$style.container" :style="styles.container">
    <user-icon
      :class="$style.userIcon"
      userId="c11b8728-f580-4c74-812e-1d6c6d73f09b"
      :size="40"
    />
    <user-icon
      :class="$style.userIcon"
      userId="c11b8728-f580-4c74-812e-1d6c6d73f09b"
      :size="40"
    />
    <user-icon
      :class="$style.userIcon"
      userId="c11b8728-f580-4c74-812e-1d6c6d73f09b"
      :size="40"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, Ref } from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import useChannelPath from '@/use/channelPath'
import UserIcon from '@/components/UI/UserIcon.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.primary,
      color: theme.ui.primary
    }))
  })

export default defineComponent({
  name: 'ChannelSideBarPinned',
  components: { UserIcon },
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
  display: flex;
  flex-basis: 250px;
  height: 60px;
  flex-direction: row-reverse;
  justify-content: flex-end;
  position: relative;
}

// 左との間隔をあけたいけどどうしようってなった
.userIcon {
  margin-top: 10px;
  margin-right: -12px;
  border: 3px solid white;
}
</style>
