<template>
  <modal-frame title="QR Code" icon-mdi icon-name="qrcode">
    <div
      v-if="!state.err"
      :class="$style.qrCodeModalImage"
      :style="qrImageStyle"
    />
    <div v-else>
      エラーが起きました<br />
      {{ state.err }}
    </div>
  </modal-frame>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  onUnmounted,
  reactive
} from '@vue/composition-api'
import apis from '@/lib/api'
import { makeStyles } from '@/lib/styles'
import ModalFrame from '../Common/ModalFrame.vue'

export default defineComponent({
  name: 'QrCodeModal',
  components: {
    ModalFrame
  },
  setup(props) {
    const state = reactive({
      url: '',
      err: ''
    })

    onMounted(() => {
      makeBlob()
        .then(value => {
          state.url = value
        })
        .catch(err => {
          state.err = err
        })
    })

    onUnmounted(() => {
      URL.revokeObjectURL(state.url)
    })

    const makeBlob = async () => {
      const response = await apis
        .getMyQRCode(false, {
          responseType: 'arraybuffer'
        })
        .catch(e => {
          throw new Error(e)
        })

      const blob = new Blob([response.data], { type: 'image/png' })

      return URL.createObjectURL(blob)
    }

    const qrImageStyle = makeStyles(() => ({
      backgroundImage: `url(${state.url})`
    }))

    return { qrImageStyle, state }
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
