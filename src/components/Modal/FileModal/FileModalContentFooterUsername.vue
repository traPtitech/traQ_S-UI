<template>
  <div :class="$style.container" @click="openModal">
    <AIcon name="user" :size="20" />
    {{ displayName ?? 'unknown' }}
  </div>
</template>

<script lang="ts" setup>
import { computed, toRef } from 'vue'

import AIcon from '/@/components/UI/AIcon.vue'
import { useUserModalOpener } from '/@/composables/modal/useUserModalOpener'
import { useUsersStore } from '/@/store/entities/users'
import type { UserId } from '/@/types/entity-ids'

const props = defineProps<{
  userId?: UserId
}>()

const { usersMap } = useUsersStore()
const displayName = computed(
  () => usersMap.value.get(props.userId ?? '')?.displayName
)

const { openModal } = useUserModalOpener(toRef(props, 'userId'))
</script>

<style lang="scss" module>
.container {
  display: flex;
  cursor: pointer;
}
</style>
