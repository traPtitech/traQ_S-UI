<template>
  <section v-if="isSuspended" :class="$style.container">
    <a-icon name="cancel" mdi :class="$style.icon" />
    <p>このユーザーは一時的に無効になっています</p>
  </section>
  <section v-else-if="isDeactivated" :class="$style.container">
    <a-icon name="snowflake" mdi :class="$style.icon" />
    <p>このユーザーは凍結されています</p>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { UserAccountState } from '@traptitech/traq'
import AIcon from '/@/components/UI/AIcon.vue'

export default defineComponent({
  name: 'AccountState',
  components: {
    AIcon
  },
  props: {
    state: {
      type: Number as PropType<UserAccountState>,
      required: true
    }
  },
  setup(props) {
    const isDeactivated = computed(
      () => props.state === UserAccountState.deactivated
    )
    const isSuspended = computed(
      () => props.state === UserAccountState.suspended
    )
    return { isDeactivated, isSuspended }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  display: flex;
  font-weight: bold;
}
.icon {
  margin-right: 8px;
}
</style>
