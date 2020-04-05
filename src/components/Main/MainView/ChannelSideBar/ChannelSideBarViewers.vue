<template>
  <div :class="$style.container" :style="styles.container">
    <user-icon
      :class="$style.userIcon"
      :userId="userId"
      :size="40"
      v-for="userId in state.viewerIds"
      :key="userId"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, Ref } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import UserIcon from '@/components/UI/UserIcon.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.primary,
      color: theme.ui.primary
    }))
  })

export default defineComponent({
  name: 'ChannelSideBarViewers',
  components: { UserIcon },
  setup() {
    const styles = useStyles()
    const state = reactive({
      viewersId: computed(
        () => store.state.domain.messagesView.currentViewerIds
      )
    })
    return {
      styles,
      state
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  widows: 250px;
  height: 60px;
  flex-direction: row-reverse;
  justify-content: flex-end;
  position: relative;
  margin-left: 27px;
}

// 左との間隔をあけたいけどどうしようってなった
.userIcon {
  margin-top: 10px;
  margin-right: -12px;
  border: 3px solid white;
}
</style>
