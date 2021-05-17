<template>
  <div :class="$style.wrapper">
    <close-button :class="$style.close" with-text :size="56" @close="close" />
    <section :class="$style.container">
      <div :class="[$style.header, $style.item]">
        <h2 :class="$style.title">ユーザーグループ管理</h2>
        <form-button label="新規作成" />
      </div>
      <p :class="[$style.desc, $style.item]">
        自分が管理者になっているユーザーグループ一覧
      </p>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import CloseButton from '@/components/UI/CloseButton.vue'
import useClose from './use/close'
import FormButton from '@/components/UI/FormButton.vue'

export default defineComponent({
  name: 'DesktopGroupManager',
  components: {
    CloseButton,
    FormButton
  },
  setup() {
    const { close } = useClose()
    return { close }
  }
})
</script>

<style lang="scss" module>
.wrapper {
  @include background-primary;
  position: relative;
  display: flex;
  flex-flow: row;
  width: 100%;
  height: 100%;
}
.close {
  position: absolute;
  top: 30px;
  right: 60px;
}

.container {
  width: 100%;
  max-width: 720px;
  height: 100%;
  padding: 64px 32px;
  margin: auto;
}
.item {
  margin: 24px 0;
  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }
}

.header {
  @include color-ui-primary;
  display: flex;
  align-items: center;
}
.title {
  @include size-h1;
  margin-right: auto;
  font-weight: bold;
}

.desc {
  @include color-ui-secondary;
}
</style>
