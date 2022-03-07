<template>
  <return-button @click="popOrCloseModal" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ReturnButton from '/@/components/UI/ReturnButton.vue'
import { useModalStore } from '/@/store/ui/modal'

export default defineComponent({
  name: 'ModalReturnButton',
  components: {
    ReturnButton
  },
  setup() {
    const { popOrCloseModal } = useModalStore()
    return { popOrCloseModal }
  }
})
</script>

<style lang="scss" module></style>
