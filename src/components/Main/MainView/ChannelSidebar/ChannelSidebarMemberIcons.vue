<template>
  <div :class="$style.container">
    <div
      v-for="state in viewerStates"
      :class="[state.viewing ? '' : $style.notView, $style.member]"
      :key="state.user.id"
    >
      <user-icon :size="28" :user-id="state.user.id" />
      <span :class="$style.name">{{ state.user.displayName }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'

import UserIcon from '@/components/UI/UserIcon.vue'
import { User } from '@traptitech/traq'

type ViewState = {
  user: User
  viewing: boolean
}

export default defineComponent({
  name: 'ChannelSidebarMember',
  components: { UserIcon },
  props: {
    viewerStates: { type: Array as PropType<ViewState[]>, default: [] }
  },
  setup(props) {
    return {}
  }
})
</script>

<style lang="scss" module>
.container {
  @include background-primary;
  @include color-ui-secondary;
  display: flex;
  flex-direction: column;
}

.member {
  margin-bottom: 8px;
  display: flex;
  font-weight: bold;
  align-items: center;
}

.notView {
  opacity: 0.5;
}

.name {
  margin-left: 8px;
}
</style>
