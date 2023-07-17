<template>
  <div v-if="user" :class="$style.container">
    <user-icon :class="$style.userIcon" :user-id="id" prevent-modal />
    <div :class="$style.content">
      <div :class="$style.displayName">{{ user.displayName }}</div>
      <slot />
    </div>
    <div :class="$style.controls">
      <icon-button
        v-if="showEditButton"
        icon-name="pencil-outline"
        icon-mdi
        :class="$style.controlIconButton"
        @click="emit('edit')"
      />
      <icon-button
        icon-name="close"
        icon-mdi
        :class="$style.controlIconButton"
        @click="emit('delete')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import UserIcon from '/@/components/UI/UserIcon.vue'
import { computed } from 'vue'
import type { UserId } from '/@/types/entity-ids'
import { useUsersStore } from '/@/store/entities/users'
import IconButton from '/@/components/UI/IconButton.vue'

const props = withDefaults(
  defineProps<{
    id: UserId
    showEditButton?: boolean
  }>(),
  {
    showEditButton: false
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
.controlIconButton {
  @include color-ui-secondary-inactive;
  cursor: pointer;
  &:hover,
  &:focus {
    @include color-ui-secondary;
  }
}
</style>
