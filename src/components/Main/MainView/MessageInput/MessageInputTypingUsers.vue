<template>
  <transition name="typing-users">
    <div v-if="typingUsers.length > 0" :class="$style.container">
      <message-input-typing-animation />
      <div :class="$style.text">
        {{ text }}
      </div>
      <user-icon-ellipsis-list
        direction="row"
        transition="fade-left"
        :show-count="false"
        :user-ids="typingUsers"
        :border-width="1"
        :icon-size="24"
        :overlap="8"
      />
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import { UserId } from '/@/types/entity-ids'
import UserIconEllipsisList from '/@/components/UI/UserIconEllipsisList.vue'
import MessageInputTypingAnimation from './MessageInputTypingAnimation.vue'

export default defineComponent({
  name: 'MessageInputTypingUsers',
  components: {
    MessageInputTypingAnimation,
    UserIconEllipsisList
  },
  props: {
    typingUsers: {
      type: Array as PropType<readonly UserId[]>,
      required: true
    }
  },
  setup(props) {
    const text = computed(
      () =>
        `${props.typingUsers.length > 3 ? 'and others' : ''} ${
          props.typingUsers.length === 1 ? 'is' : 'are'
        } typing`
    )

    return { text }
  }
})
</script>

<style lang="scss" module>
.container {
  position: absolute;
  top: -4px;
  left: 0;
  transform: translateY(-100%);
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
}

.text {
  @include color-text-secondary;
  margin: 0 4px;
}
</style>
