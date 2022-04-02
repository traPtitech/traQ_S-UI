<template>
  <div :class="$style.container" @click="openModal">
    <a-icon name="user" :size="20" />
    {{ displayName ?? 'unknown' }}
  </div>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'
import { computed, toRef } from 'vue'
import type { UserId } from '/@/types/entity-ids'
import { useUserModalOpener } from '/@/composables/modal/useUserModalOpener'
import { useUsersStore } from '/@/store/entities/users'

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
