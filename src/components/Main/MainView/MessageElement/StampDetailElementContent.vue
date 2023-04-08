<template>
  <div :class="$style.container" @click="openModal">
    {{ user?.displayName ?? 'unknown' }}
    <span :class="$style.numberWrap">
      <spin-number :value="count" />
    </span>
  </div>
</template>

<script lang="ts" setup>
import SpinNumber from '/@/components/UI/SpinNumber.vue'
import { computed, toRef } from 'vue'
import type { UserId } from '/@/types/entity-ids'
import { useUserModalOpener } from '/@/composables/modal/useUserModalOpener'
import { useUsersStore } from '/@/store/entities/users'

const props = defineProps<{
  userId: UserId
  count: number
}>()

const { usersMap } = useUsersStore()
const user = computed(() => usersMap.value.get(props.userId))

const { openModal } = useUserModalOpener(toRef(props, 'userId'))
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-wrap: wrap;
  cursor: pointer;
}
.numberWrap {
  display: flex;
  height: 1.5rem;
  overflow: hidden;
  &::before {
    content: '(';
    display: block;
  }
  &::after {
    content: ')';
    display: block;
  }
}
</style>
