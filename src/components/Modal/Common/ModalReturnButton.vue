<template>
  <return-button @click="popOrCloseModal" />
</template>

<script lang="ts" setup>
import ReturnButton from '/@/components/UI/ReturnButton.vue';
import { useModalStore } from '/@/store/ui/modal'

const { popOrCloseModal } = useModalStore()
</script>

<style lang="scss" module></style>
