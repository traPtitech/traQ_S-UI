<template>
  <div v-if="user" :class="$style.container">
    <user-icon :class="$style.userIcon" :user-id="id" prevent-modal />
    <div :class="$style.content">
      <div>{{ user.displayName }}</div>
      <slot />
    </div>
    <div :class="$style.controls">
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
import { UserId } from '@/types/entity-ids'
import UserIcon from '@/components/UI/UserIcon.vue'
import store from '@/store'
import Icon from '@/components/UI/Icon.vue'

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
    }
  },
  setup(props, { emit }) {
    const user = computed(() => store.state.entities.usersMap.get(props.id))

    const onClickDelete = () => {
      emit('delete')
    }

    return { user, onClickDelete }
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
  margin: 0 4px;
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
