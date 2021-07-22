<template>
  <return-button @click="onClickPop" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import store from '/@/store'
import ReturnButton from '/@/components/UI/ReturnButton.vue'

export default defineComponent({
  name: 'ModalReturnButton',
  components: {
    ReturnButton
  },
  setup() {
    const onClickPop = () => {
      store.dispatch.ui.modal.popOrCloseModal()
    }
    return { onClickPop }
  }
})
</script>

<style lang="scss" module></style>
