<template>
  <div :class="$style.container">
    <div :class="$style.header">
      <h2 :class="$style.title">ユーザーグループ管理</h2>
      <close-button :size="36" @close="close" />
    </div>
    <div :class="$style.content">
      <div :class="[$style.createButtonWrapper, $style.item]">
        <form-button label="新規作成" />
      </div>
      <p :class="[$style.desc, $style.item]">
        自分が管理者になっているユーザーグループ一覧
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import CloseButton from '@/components/UI/CloseButton.vue'
import useClose from './use/close'
import FormButton from '@/components/UI/FormButton.vue'

export default defineComponent({
  name: 'MobileGroupManager',
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
.container {
  @include background-primary;
  width: 100%;
  height: 100%;
}

.header {
  @include color-ui-primary;
  @include background-secondary;
  display: flex;
  padding: 20px 12px;
  align-items: center;
}
.title {
  @include size-h2;
  padding-left: 40px;
  flex: 1;
  font-weight: bold;
}

.content {
  padding: 16px 24px;
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
.createButtonWrapper {
  display: flex;
  justify-content: flex-end;
}
.desc {
  @include color-ui-secondary;
}
</style>
