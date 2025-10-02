<template>
  <button :class="$style.button">
    <slot />
  </button>
</template>

<style lang="scss" module>
.button {
  width: 33px;
  height: 22px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: '';
    position: absolute;
    display: block;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    border-radius: 0.4rem;
    background: currentColor;
    opacity: 0;
  }

  &:hover::after,
  &:active::after {
    opacity: 0.1;
  }

  &[aria-selected='true']::after {
    opacity: 0.1;
    background-color: $theme-accent-primary-default;
  }
}
</style>
