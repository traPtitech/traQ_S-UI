<template>
  <div :class="$style.clickable" @click="openModal">
    {{ user?.displayName ?? 'unknown' }}
    <span v-if="count > 1" :class="$style.numberWrap">
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
.clickable {
  display: flex;
  cursor: pointer;
  gap: 2px;
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
