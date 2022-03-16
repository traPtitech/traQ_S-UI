<template>
  <div :class="$style.container">
    <user-icon :user-id="userId" />
    <span :class="$style.name">{{ name }}</span>
    <a-toggle v-model="value" />
  </div>
</template>

<script lang="ts" setup>
import AToggle from '/@/components/UI/AToggle.vue'
import UserIcon from '/@/components/UI/UserIcon.vue'
import { computed } from 'vue'
import { UserId } from '/@/types/entity-ids'
import { useUsersStore } from '/@/store/entities/users'

const props = defineProps<{
  userId: UserId
  subscribed: boolean
}>()

const emit = defineEmits<{
  (e: 'changeNotification', _userId: UserId, _val: boolean): void
}>()

const { usersMap } = useUsersStore()

const value = computed({
  get: () => props.subscribed,
  set: _v => {
    emit('changeNotification', props.userId, !props.subscribed)
  }
})
const name = computed(() => usersMap.value.get(props.userId)?.name ?? '')
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  display: grid;
  grid-template-columns: 36px 1fr 44px;
  column-gap: 8px;
  align-items: center;
  width: 100%;
  height: 36px;
}
.name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
