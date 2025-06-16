<template>
  <modal-frame
    title="QR Code"
    icon-mdi
    icon-name="qrcode"
    :class="$style.qrCodeModalFrame"
  >
    <img v-if="!state.err" :src="state.url" :class="$style.qrCodeModalImage" />
    <modal-section v-else title="エラー" :description="state.err" />
  </modal-frame>
</template>

<script lang="ts">
import type { AxiosError } from 'axios'
import { reactive, onMounted, onUnmounted } from 'vue'
import apis from '/@/lib/apis'
import useScreenWakeLock from '/@/composables/dom/useScreenWakeLock'

const useQrCode = () => {
  const state = reactive({
    url: '',
    err: ''
  })

  onMounted(async () => {
    try {
      state.url = await makeURL()
    } catch (err) {
      state.err = (err as AxiosError).toString()
    }
  })

  onUnmounted(() => {
    URL.revokeObjectURL(state.url)
  })

  const makeURL = async () => {
    const { data } = await apis.getMyQRCode(false, {
      responseType: 'blob'
    })

    return URL.createObjectURL(data)
  }

  return { state }
}
</script>

<script lang="ts" setup>
import ModalFrame from '../Common/ModalFrame.vue'
import ModalSection from '../Common/ModalSection.vue'

const { state } = useQrCode()
useScreenWakeLock()
</script>

<style lang="scss" module>
.qrCodeModalImage {
  max-height: 50vh;
  height: 100%;
  width: 100%;
  object-fit: contain;
}
.qrCodeModalFrame {
  max-height: 90vh;
}
</style>
