<template>
  <sidebar-content-container clickable title="閲覧者" @toggle="toggle">
    <div v-for="user in users" :key="user.id" :class="$style.item">
      <user-icon :user-id="user.id" :size="32" />
      <div :class="$style.userName">{{ user.displayName }}</div>
    </div>
  </sidebar-content-container>
</template>

<script lang="ts" setup>
import UserIcon from '/@/components/UI/UserIcon.vue';
import SidebarContentContainer from '/@/components/Main/MainView/MainViewSidebar/SidebarContentContainer.vue';
import { computed } from 'vue';
import { UserId } from '/@/types/entity-ids'
import { isDefined } from '/@/lib/basic/array'
import { useUsersStore } from '/@/store/entities/users'

const props = withDefaults(defineProps<{
    viewerIds?: readonly UserId[]
}>(), {
    viewerIds: () => []
});

const emit = defineEmits<{
    (e: "toggle"): void
}>();

const { usersMap } = useUsersStore()

const toggle = () => {
  emit('toggle')
}
const users = computed(() =>
  props.viewerIds.map(id => usersMap.value.get(id)).filter(isDefined)
)
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
