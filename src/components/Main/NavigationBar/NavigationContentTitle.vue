<template>
  <h2 :class="$style.container">
    <slot />
  </h2>
</template>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  @include size-h2;
  font-weight: bold;
  padding-bottom: 24px;
}
</style>
