<template>
  <modal-frame title="QR Code" icon-mdi icon-name="qrcode">
    <div
      v-if="!err"
      :class="$style.qrCodeModalImage"
      :style="styles.container"
    />
    <modal-section v-else title="エラー" :description="err" />
  </modal-frame>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  onMounted,
  onUnmounted,
  toRefs,
  Ref
} from '@vue/composition-api'

import { makeStyles } from '@/lib/styles'
import ModalFrame from '../Common/ModalFrame.vue'
import ModalSection from '../Common/ModalSection.vue'
import apis from '@/lib/api'

const useStyles = (url: Ref<string>) =>
  reactive({
    container: makeStyles(() => ({
      backgroundImage: `url(${url.value})`
    }))
  })

const useQrCode = () => {
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
        throw e
      })

    const blob = new Blob([response.data], { type: 'image/png' })

    return URL.createObjectURL(blob)
  }

  return { ...toRefs(state) }
}

export default defineComponent({
  name: 'QrCodeModal',
  components: {
    ModalFrame,
    ModalSection
  },
  setup(props) {
    const { url, err } = useQrCode()
    const styles = useStyles(url)
    return { styles, err }
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
