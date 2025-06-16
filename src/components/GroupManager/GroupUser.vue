<template>
  <div v-if="user" :class="$style.container">
    <user-icon :class="$style.userIcon" :user-id="id" prevent-modal />
    <div :class="$style.content">
      <div :class="$style.displayName">
        {{ user.displayName }}
      </div>
      <slot />
    </div>
    <div :class="$style.controls">
      <a-icon
        v-if="showEditButton"
        name="pencil-outline"
        mdi
        :class="$style.controlIcon"
        @click="emit('edit')"
      />
      <a-icon
        name="close"
        mdi
        :class="$style.controlIcon"
        @click="emit('delete')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import UserIcon from '/@/components/UI/UserIcon.vue'
import AIcon from '/@/components/UI/AIcon.vue'
import { computed } from 'vue'
import type { UserId } from '/@/types/entity-ids'
import { useUsersStore } from '/@/store/entities/users'

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
.controlIcon {
  @include color-ui-secondary-inactive;
  cursor: pointer;
  &:hover {
    @include color-ui-secondary;
  }
}
</style>
