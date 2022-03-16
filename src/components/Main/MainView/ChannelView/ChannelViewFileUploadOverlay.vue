<template>
  <div :class="$style.container">
    <span :class="$style.icon">
      <a-icon mdi name="file-upload" :size="72" />
    </span>
    <p>ドロップしてファイルをアップロード</p>
    <p>またはテキストを追加</p>
  </div>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'
</script>

<style lang="scss" module>
$messagePadding: 32px;

.container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(5px);
  font-weight: bold;
  &::before {
    @include background-primary;
    top: 0;
    left: 0;
    display: block;
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0.8;
    z-index: -1;
  }
}

.icon {
  @include background-secondary;
  width: 120px;
  height: 120px;
  border-radius: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
}
</style>
