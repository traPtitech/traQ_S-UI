<template>
  <div :class="$style.user">
    <img :src="saved.iconURL ?? undefined" :class="$style.userIcon" />
    <p :class="$style.name">{{ saved.id }}</p>
  </div>
  <div :class="$style.buttons">
    <authenticate-button
      :class="$style.button"
      type="primary"
      label="上のアカウントでログイン"
      @click="onLoginClick"
    />
    <authenticate-button
      :class="$style.button"
      type="secondary"
      label="ほかでログイン"
      @click="onUseOtherClick"
    />
  </div>
</template>

<script lang="ts" setup>
import AuthenticateButton from './AuthenticateButton.vue';

defineProps<{
    saved: PasswordCredential
}>()

const emit = defineEmits<{
    (e: "login"): void,
    (e: "useOther"): void
}>();

const onLoginClick = () => {
  emit('login')
}
const onUseOtherClick = () => {
  emit('useOther')
}
</script>

<style lang="scss" module>
.user {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 16px;
}
.userIcon {
  height: 64px;
  width: 64px;
  border-radius: 50%;
  margin-right: 16px;
}
.name {
  @include color-ui-secondary;
}
.buttons {
  margin-top: 48px;
}
.button {
  margin: 32px auto;
  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }
}
</style>
