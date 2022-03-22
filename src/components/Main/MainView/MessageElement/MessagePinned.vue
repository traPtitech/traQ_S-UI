<template>
  <div :class="$style.container">
    <a-icon name="pin" mdi :size="16" :class="$style.pin" />
    {{ userDisplayName }}さんがピン留めしました
  </div>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'
import { computed } from 'vue'
import { UserId } from '/@/types/entity-ids'
import { useUsersStore } from '/@/store/entities/users'

const props = defineProps<{
  pinnedUserId: UserId
}>()

const { usersMap } = useUsersStore()
const userDisplayName = computed(() => {
  const user = usersMap.value.get(props.pinnedUserId)
  return user?.displayName
})
</script>

<style lang="scss" module>
.container {
  @include color-text-secondary;
  display: flex;
  align-items: center;
}
.pin {
  color: $common-ui-pin;
  margin-right: 8px;
  flex-shrink: 0;
}
</style>
