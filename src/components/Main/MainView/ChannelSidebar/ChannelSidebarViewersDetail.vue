<template>
  <sidebar-content-container clickable title="閲覧者" @toggle="closeDetail">
    <div v-for="user in users" :key="user.id" :class="$style.item">
      <user-icon :user-id="user.id" :size="32" />
      <div :class="$style.userName">{{ user.displayName }}</div>
    </div>
  </sidebar-content-container>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import UserIcon from '/@/components/UI/UserIcon.vue'
import { UserId } from '/@/types/entity-ids'
import SidebarContentContainer from '/@/components/Main/MainView/MainViewSidebar/SidebarContentContainer.vue'
import store from '/@/store'
import { isDefined } from '/@/lib/util/array'

export default defineComponent({
  name: 'ChannelSidebarViewerDetail',
  components: { UserIcon, SidebarContentContainer },
  props: {
    viewerIds: {
      type: Array as PropType<UserId[]>,
      default: () => []
    }
  },
  setup(props, context) {
    const closeDetail = () => {
      context.emit('close')
    }
    const users = computed(() =>
      props.viewerIds
        .map(id => store.state.entities.usersMap.get(id))
        .filter(isDefined)
    )
    return { closeDetail, users }
  }
})
</script>

<style lang="scss" module>
.item {
  display: flex;
  align-items: center;
  margin: 4px 0;
  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }
}
.userName {
  margin-left: 8px;
  font-weight: bold;
  word-break: normal;
  overflow-wrap: break-word; // for Safari
  overflow-wrap: anywhere;
}
</style>
