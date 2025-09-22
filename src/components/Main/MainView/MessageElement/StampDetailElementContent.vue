<template>
  <div :class="$style.clickable" @click="openModal">
    <span>{{ displayName }}</span>
    <span :class="$style.tails">
      <span v-if="count > 1" :class="$style.numberWrap">
        <SpinNumber :value="count" />
      </span>
      <slot />
    </span>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRef } from 'vue'
import type { UserId } from '/@/types/entity-ids'
import { useUserModalOpener } from '/@/composables/modal/useUserModalOpener'
import { useUsersStore } from '/@/store/entities/users'
import SpinNumber from '/@/components/UI/SpinNumber.vue'

const props = defineProps<{
  userId: UserId
  count: number
}>()

const { usersMap } = useUsersStore()
const user = computed(() => usersMap.value.get(props.userId))
const displayName = computed(() => user.value?.displayName ?? 'unknown')

const { openModal } = useUserModalOpener(toRef(props, 'userId'))
</script>

<style lang="scss" module>
.clickable {
  display: inline;
  word-break: break-all;
  cursor: pointer;
}
.numberWrap {
  display: inline-flex;
  height: 1.5rem;
  margin-left: 0.2em;
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
.tails {
  display: inline-block;
}
</style>
