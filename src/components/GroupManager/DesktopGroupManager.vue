<template>
  <div :class="$style.wrapper">
    <close-button :class="$style.close" with-text :size="56" @close="close" />
    <section :class="$style.container">
      <div :class="[$style.header, $style.item]">
        <h2 :class="$style.title">ユーザーグループ管理</h2>
        <form-button
          :class="$style.createButton"
          label="新規作成"
          @click="openGroupCreateModal"
        />
      </div>
      <p :class="[$style.desc, $style.item]">
        自分が管理者になっているユーザーグループ一覧
      </p>
      <group-list :class="[$style.list, $style.item]" />
    </section>
  </div>
</template>

<script lang="ts" setup>
import CloseButton from '/@/components/UI/CloseButton.vue'
import FormButton from '/@/components/UI/FormButton.vue'
import GroupList from './GroupList.vue'
import useClose from '/@/composables/useClose'
import useGroupCreateModalOpener from '/@/composables/modal/useGroupCreateModalOpener'

const { close } = useClose()
const { openGroupCreateModal } = useGroupCreateModalOpener()
</script>

<style lang="scss" module>
.wrapper {
  @include background-primary;
  position: relative;
  display: flex;
  flex-flow: row;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  scrollbar-gutter: stable;
}
.close {
  position: fixed;
  top: 30px;
  right: 60px;
}

.container {
  width: 100%;
  max-width: 720px + (140px - 32px) * 2;
  padding: 64px 140px;
  margin: 0 auto;
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
  justify-content: center;
  align-items: center;
}
.title {
  @include size-h1;
  margin-right: auto;
  font-weight: bold;
}
.createButton {
  word-break: keep-all;
}

.desc {
  @include color-ui-secondary;
}
.list {
  padding: 0 16px;
}
</style>
