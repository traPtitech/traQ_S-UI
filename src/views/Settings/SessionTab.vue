<template>
  <div>
    <AccountState :class="$style.element" />
    <ViewStates :class="$style.element" />
    <PasswordChange :class="$style.element" />
    <TokenManager :class="$style.element" />
  </div>
</template>

<script lang="ts" setup>
import AccountState from '/@/components/Settings/SessionTab/AccountState.vue'
import ViewStates from '/@/components/Settings/SessionTab/ViewStates.vue'
import PasswordChange from '/@/components/Settings/SessionTab/PasswordChange.vue'
import TokenManager from '/@/components/Settings/SessionTab/TokenManager.vue'
</script>

<style lang="scss" module>
.element {
  margin: 24px 0;
}
</style>
