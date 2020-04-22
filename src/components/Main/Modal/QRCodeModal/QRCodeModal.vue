<template>
  <modal-frame title="QR Code" icon-mdi icon-name="qrcode">
    <img v-if="!state.err" :src="state.url" :class="$style.qrCodeModalImage" />
    <modal-section v-else title="エラー" :description="state.err" />
  </modal-frame>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  onMounted,
  onUnmounted
} from '@vue/composition-api'
import ModalFrame from '../Common/ModalFrame.vue'
import ModalSection from '../Common/ModalSection.vue'
import apis from '@/lib/api'

const useQrCode = () => {
  const state = reactive({
    url: '',
    err: ''
  })

  onMounted(async () => {
    try {
      state.url = await makeURL()
    } catch (err) {
      state.err = err
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

export default defineComponent({
  name: 'QrCodeModal',
  components: {
    ModalFrame,
    ModalSection
  },
  setup() {
    const { state } = useQrCode()

    return { state }
  }
})
</script>

<style lang="scss" module>
.qrCodeModalImage {
  height: 50vh;
  background: {
    size: contain;
    position: center;
    repeat: no-repeat;
  }
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
</style>
