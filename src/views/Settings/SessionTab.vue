<template>
  <section>
    <account-state :class="$style.element" />
    <view-states :class="$style.element" />
    <password-change :class="$style.element" />
    <token-manager :class="$style.element" />
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AccountState from '/@/components/Settings/SessionTab/AccountState.vue'
import ViewStates from '/@/components/Settings/SessionTab/ViewStates.vue'
import PasswordChange from '/@/components/Settings/SessionTab/PasswordChange.vue'
import TokenManager from '/@/components/Settings/SessionTab/TokenManager.vue'

export default defineComponent({
  name: 'SessionTab',
  components: {
    AccountState,
    ViewStates,
    PasswordChange,
    TokenManager
  },
  setup() {
    return {}
  }
})
</script>

<style lang="scss" module>
.element {
  margin: 24px 0;
}
</style>
