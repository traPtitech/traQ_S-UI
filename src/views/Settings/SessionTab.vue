<template>
  <section>
    <account :class="$style.element" />
    <password :class="$style.element" />
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Account from '@/components/Settings/SessionTab/Account.vue'
import Password from '@/components/Settings/SessionTab/Password.vue'

export default defineComponent({
  name: 'SessionTab',
  components: {
    Account,
    Password
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
