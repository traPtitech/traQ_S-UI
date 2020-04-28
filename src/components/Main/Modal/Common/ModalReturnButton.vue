<template>
  <return-button @click="onClickPop" />
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import store from '@/store'
import ReturnButton from '@/components/UI/ReturnButton.vue'

export default defineComponent({
  name: 'ModalReturnButton',
  components: {
    ReturnButton
  },
  setup() {
    const onClickPop = () => {
      if (store.state.ui.modal.isOnInitialModalRoute) {
        store.dispatch.ui.modal.closeModal()
      } else {
        store.dispatch.ui.modal.popModal()
      }
    }
    return { onClickPop }
  }
})
</script>

<style lang="scss" module></style>
