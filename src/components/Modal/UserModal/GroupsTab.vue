<template>
  <div :class="$style.groups">
    <template v-if="isLoading">Now loading...</template>
    <template v-else>
      <ul :class="$style.list">
        <li
          v-for="group in groups"
          :key="group.id"
          :class="$style.group"
          @click="onGroupClick(group.id)"
        >
          <a-icon name="group" :class="$style.icon" :size="20" />
          {{ group.name }}
        </li>
      </ul>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import store from '/@/vuex'
import { UserDetail } from '@traptitech/traq'
import { UserGroupId } from '/@/types/entity-ids'
import AIcon from '/@/components/UI/AIcon.vue'
import { isDefined } from '/@/lib/basic/array'

export default defineComponent({
  name: 'GroupsTab',
  components: {
    AIcon
  },
  props: {
    detail: {
      type: Object as PropType<UserDetail>,
      default: undefined
    }
  },
  setup(props) {
    const isLoading = computed(() => props.detail === undefined)
    const groups = computed(
      () =>
        props.detail?.groups
          .map(groupId => store.state.entities.userGroupsMap.get(groupId))
          .filter(isDefined) ?? []
    )

    const onGroupClick = (id: UserGroupId) => {
      store.dispatch.ui.modal.pushModal({
        type: 'group',
        id
      })
    }

    return { isLoading, groups, onGroupClick }
  }
})
</script>

<style lang="scss" module>
.groups {
  @include color-ui-primary;
  height: 100%;
}

.list {
  overflow-y: scroll;
  min-height: 100%;
}

.group {
  position: relative;
  margin: 8px 4px;
  padding: 4px;
  cursor: pointer;
  &:first-child {
    // ナビゲーションと頭を揃える
    margin-top: 0;
  }

  &:hover::before {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: $theme-ui-primary-background;
    opacity: 0.1;
  }
}

.icon {
  vertical-align: bottom;
  margin-right: 4px;
}
</style>
