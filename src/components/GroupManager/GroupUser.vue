<template>
  <div v-if="user" :class="$style.container">
    <UserIcon :class="$style.userIcon" :user-id="id" prevent-modal />
    <div :class="$style.content">
      <div :class="$style.displayName" dir="auto">
        {{ user.displayName }}
      </div>
      <slot />
    </div>
    <div :class="$style.controls">
      <AIcon
        v-if="showEditButton"
        name="pencil-outline"
        mdi
        :class="$style.controlIcon"
        @click="emit('edit')"
      />
      <button
        aria-label="ユーザーを削除"
        :disabled
        :class="$style.controlIcon"
        @click="emit('delete')"
      >
        <AIcon name="close" mdi />
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import AIcon from '/@/components/UI/AIcon.vue'
import UserIcon from '/@/components/UI/UserIcon.vue'
import { useUsersStore } from '/@/store/entities/users'
import type { UserId } from '/@/types/entity-ids'

const props = withDefaults(
  defineProps<{
    id: UserId
    showEditButton?: boolean
    disabled?: boolean
  }>(),
  {
    showEditButton: false,
    disabled: false
  }
)

const emit = defineEmits<{
  (e: 'edit'): void
  (e: 'delete'): void
}>()

const { usersMap } = useUsersStore()
const user = computed(() => usersMap.value.get(props.id))
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  display: flex;
  align-items: center;
}
.userIcon {
  flex-shrink: 0;
}
.content {
  flex: 1;
  min-width: 0;
  margin: 0 4px;
}
.displayName {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: left;
}
.controls {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  opacity: 0;
  .container:hover & {
    opacity: 1;
  }
}
.controls:has(.controlIcon:focus-visible) {
  opacity: 1;
}

.controlIcon {
  @include color-ui-secondary-inactive;
  display: flex;
  align-items: center;
  cursor: pointer;
  &:hover {
    @include color-ui-secondary;
  }
  &:disabled {
    cursor: not-allowed;
    @include color-ui-secondary-inactive;
  }
  &:focus {
    @include color-ui-secondary;
    outline: 2px solid #6698aa;
    outline-offset: 2px;
  }
}
</style>
