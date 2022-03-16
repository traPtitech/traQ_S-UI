<template>
  <div :class="$style.container" @click="openModal">
    <a-icon name="user" :size="20" />
    {{ user?.displayName ?? 'unknown' }}
  </div>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue';
import { computed } from 'vue';
import { UserId } from '/@/types/entity-ids'
import { useUserModalOpener } from '/@/composables/useModalOpener'
import { useUsersStore } from '/@/store/entities/users'

const props = defineProps<{
    userId?: UserId
}>();

const { usersMap } = useUsersStore()

const user = computed(() => usersMap.value.get(props.userId ?? ''))

const { openModal } = useUserModalOpener(props, user)
</script>

<style lang="scss" module>
.container {
  display: flex;
  cursor: pointer;
}
</style>
