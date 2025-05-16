<template>
  <form-button
    label="新規作成"
    :class="$style.formButton"
    icon="plus"
    mdi
    type="secondary"
    @click="openStampPaletteCreateTab"
  />
</template>

<script lang="ts" setup>
import FormButton from '/@/components/UI/FormButton.vue'
const openStampPaletteCreateTab = () => {
  // TODO: implement open stamp palette create modal
}
</script>

<style lang="scss" module>
.formButton {
  max-width: fit-content;
}
</style>
