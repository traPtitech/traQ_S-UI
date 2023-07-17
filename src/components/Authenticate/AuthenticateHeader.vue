<template>
  <div :class="$style.container">
    <span v-if="title" :class="$style.logoWithTitle">
      <img :src="logoUrl" :class="$style.logo" alt="" />
      <span :class="$style.title">{{ title }}</span>
    </span>
    <div v-else :class="$style.fullLogo">
      <img :src="logoUrl" alt="" />
      <img :src="LogoText" :class="$style.fullLogoText" alt="traQ" role="img" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import LogoText from '/@/assets/traq-logo-text.svg?url'
import logoUrl from '/@/assets/traq-logo.svg?url'

defineProps<{
  title?: string
}>()
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
