<template>
  <div>
    <label v-for="user in users" :key="user.id" :class="$style.user">
      <form-checkbox-inner
        :model-value="modelValue.has(user.id)"
        @update:modelValue="toggle(user.id)"
      />
      <user-icon :user-id="user.id" prevent-modal :class="$style.userIcon" />
      <div :class="$style.displayName">{{ user.displayName }}</div>
    </label>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import store from '@/store'
import UserIcon from '@/components/UI/UserIcon.vue'
import FormCheckboxInner from '@/components/UI/FormCheckboxInner.vue'
import { UserId } from '@/types/entity-ids'

export default defineComponent({
  name: 'UsersSelector',
  components: {
    UserIcon,
    FormCheckboxInner
  },
  props: {
    modelValue: {
      type: Set as PropType<Set<UserId>>,
      required: true
    },
    excludeIds: {
      type: Array as PropType<UserId[]>,
      required: true
    }
  },
  setup(props, { emit }) {
    const excludeIdsSet = computed(() => new Set(props.excludeIds))
    const users = computed(() =>
      [...store.state.entities.usersMap.values()].filter(
        u => !excludeIdsSet.value.has(u.id) && !u.name.startsWith('Webhook#')
      )
    )

    const toggle = (id: string) => {
      const newModelValue = new Set(props.modelValue)
      if (newModelValue.has(id)) {
        newModelValue.delete(id)
      } else {
        newModelValue.add(id)
      }
      emit('update:modelValue', newModelValue)
    }

    return { users, toggle }
  }
})
</script>

<style lang="scss" module>
.user {
  display: flex;
  align-items: center;
  cursor: pointer;

  margin: 8px 0;
  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }
}
.userIcon {
  flex-shrink: 0;
  margin: 0 8px;
}
.displayName {
  @include color-ui-primary;
  flex: 1;
  min-width: 0;
}
</style>
