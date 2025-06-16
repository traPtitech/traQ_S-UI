<template>
  <div :class="$style.container">
    <slot />
  </div>
</template>

<style lang="scss" module>
.container {
  @include background-primary;
  @include drop-shadow-default;
  display: grid;
  row-gap: 16px;
  width: max-content;
  padding: 16px;
  border-radius: 4px;
}
</style>
