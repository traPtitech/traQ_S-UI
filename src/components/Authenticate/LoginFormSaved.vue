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

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import AuthenticateButton from './AuthenticateButton.vue'

export default defineComponent({
  name: 'LoginFormSaved',
  components: {
    AuthenticateButton
  },
  props: {
    saved: {
      type: Object as PropType<PasswordCredential>,
      required: true
    }
  },
  emits: {
    login: () => true,
    useOther: () => true
  },
  setup(props, { emit }) {
    const onLoginClick = () => {
      emit('login')
    }
    const onUseOtherClick = () => {
      emit('login')
    }
    return { onLoginClick, onUseOtherClick }
  }
})
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
