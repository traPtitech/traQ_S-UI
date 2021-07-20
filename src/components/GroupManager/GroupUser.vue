<template>
  <div v-if="user" :class="$style.container">
    <user-icon :class="$style.userIcon" :user-id="id" prevent-modal />
    <div :class="$style.content">
      <div :class="$style.displayName">{{ user.displayName }}</div>
      <slot />
    </div>
    <div :class="$style.controls">
      <icon
        v-if="showEditButton"
        name="pencil-outline"
        mdi
        :class="$style.controlIcon"
        @click="onClickEdit"
      />
      <icon
        name="close"
        mdi
        :class="$style.controlIcon"
        @click="onClickDelete"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { UserId } from '/@/types/entity-ids'
import UserIcon from '/@/components/UI/UserIcon.vue'
import store from '/@/store'
import Icon from '/@/components/UI/Icon.vue'

export default defineComponent({
  name: 'GroupUser',
  components: {
    UserIcon,
    Icon
  },
  props: {
    id: {
      type: String as PropType<UserId>,
      required: true
    },
    showEditButton: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const user = computed(() => store.state.entities.usersMap.get(props.id))

    const onClickEdit = () => {
      emit('edit')
    }
    const onClickDelete = () => {
      emit('delete')
    }

    return { user, onClickEdit, onClickDelete }
  }
})
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
  cursor: pointer;
  opacity: 0.5;
  &:hover {
    opacity: 1;
  }
}
</style>
