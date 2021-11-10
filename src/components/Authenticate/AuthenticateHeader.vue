<template>
  <div :class="$style.container">
    <span v-if="title" :class="$style.logoWithTitle">
      <img src="/@/assets/traq-logo.svg?url" :class="$style.logo" />
      <span :class="$style.title">{{ title }}</span>
    </span>
    <div v-else :class="$style.fullLogo">
      <img src="/@/assets/traq-logo.svg?url" />
      <logo-text :class="$style.fullLogoText" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import LogoText from '/@/assets/traq-logo-text.svg?component'

export default defineComponent({
  name: 'AuthenticateHeader',
  components: {
    LogoText
  },
  props: {
    title: {
      type: String,
      default: undefined
    }
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
  display: flex;
  justify-content: center;
  height: 48px;
}
.fullLogoText {
  height: 100%;
  margin-left: 10px;
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
