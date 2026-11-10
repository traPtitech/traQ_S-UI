<template>
  <div
    :role="preventModal ? 'img' : 'button'"
    :tabindex="preventModal ? undefined : 0"
    :aria-label="group?.name"
    :class="[$style.container]"
    :style="styles.container"
    @click="onClick"
    @keydown.enter="onClick"
    @keydown.space.prevent="onClick"
  ></div>
</template>

<script lang="ts" setup>
import { computed, reactive, watch } from 'vue'

import { buildUserIconPath } from '/@/lib/apis'
import { useGroupsStore } from '/@/store/entities/groups'
import { useModalStore } from '/@/store/ui/modal'
import type { FileId, GroupId } from '/@/types/entity-ids'

export type IconSize =
  200 | 160 | 100 | 64 | 48 | 44 | 40 | 36 | 32 | 28 | 24 | 20

const props = withDefaults(
  defineProps<{
    groupId: GroupId
    fallbackIconFileId?: FileId
    size?: IconSize
    preventModal?: boolean
  }>(),
  {
    size: 36,
    preventModal: false
  }
)

const { userGroupsMap, fetchUserGroup } = useGroupsStore()
const { pushModal } = useModalStore()

watch(
  () => props.groupId,
  groupId => {
    if (!groupId) return
    fetchUserGroup({ userGroupId: groupId }).catch(e => {
      // eslint-disable-next-line no-console
      console.warn('Failed to fetch group for GroupIcon', e)
    })
  },
  { immediate: true }
)

const group = computed(() => userGroupsMap.value.get(props.groupId))
const groupIconFileId = computed(
  () => group.value?.icon ?? props.fallbackIconFileId ?? ''
)
const styles = reactive({
  container: computed(() => ({
    width: `${props.size}px`,
    height: `${props.size}px`,
    backgroundImage: groupIconFileId.value
      ? `url(${buildUserIconPath(groupIconFileId.value)})`
      : undefined
  }))
})

const onClick = () => {
  if (props.preventModal || !group.value) return
  pushModal({
    type: 'group',
    id: group.value?.id
  })
}
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  position: relative;
  border-radius: 100vw;
  flex: {
    shrink: 0;
    grow: 0;
  }
  background: {
    position: center;
    repeat: no-repeat;
    size: cover;
  }
  &[role='button'] {
    cursor: pointer;
  }
}
</style>
