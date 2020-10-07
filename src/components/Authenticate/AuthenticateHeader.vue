<template>
  <div :class="$style.container">
    <span v-if="title" :class="$style.logoWithTitle">
      <img src="@/assets/traq-logo.svg" :class="$style.logo" />
      <span :class="$style.title">{{ title }}</span>
    </span>
    <img v-else src="@/assets/traq-logo-full.svg" :class="$style.fullLogo" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AuthenticateHeader',
  props: {
    title: String
  },
  setup() {
    return {}
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  height: 48px;
}
.logo {
  height: 40px;
  width: auto;
}
.fullLogo {
  height: 48px;
  width: auto;
  margin: 0 auto;
}
.logoWithTitle {
  display: flex;
  align-items: center;
  height: 48px;
  width: auto;
  font-weight: bold;
}
.title {
  margin-left: 16px;
}
</style>
