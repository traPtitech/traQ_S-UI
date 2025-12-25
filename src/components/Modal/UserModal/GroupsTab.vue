<template>
  <div :class="$style.groups">
    <template v-if="isLoading"> Now loading... </template>
    <template v-else>
      <ul :class="$style.list">
        <li
          v-for="group in groups"
          :key="group.id"
          :class="$style.group"
          @click="onGroupClick(group.id)"
        >
          <AIcon name="group" :class="$style.icon" :size="20" />
          {{ group.name }}
        </li>
      </ul>
    </template>
  </div>
</template>

<script lang="ts" setup>
import type { UserDetail } from '@traptitech/traq'

import { computed } from 'vue'

import AIcon from '/@/components/UI/AIcon.vue'
import { isDefined } from '/@/lib/basic/array'
import { compareString } from '/@/lib/basic/string'
import { useGroupsStore } from '/@/store/entities/groups'
import { useModalStore } from '/@/store/ui/modal'
import type { UserGroupId } from '/@/types/entity-ids'

const props = defineProps<{
  detail?: UserDetail
}>()

const { pushModal } = useModalStore()
const { userGroupsMap } = useGroupsStore()

const isLoading = computed(() => props.detail === undefined)
const groups = computed(
  () =>
    props.detail?.groups
      .map(groupId => userGroupsMap.value.get(groupId))
      .filter(isDefined)
      .sort((a, b) => compareString(a.name, b.name)) ?? []
)

const onGroupClick = (id: UserGroupId) => {
  pushModal({
    type: 'group',
    id
  })
}
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
