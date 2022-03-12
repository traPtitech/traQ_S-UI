<template>
  <div :class="$style.app" :data-is-mobile="$boolAttr(isMobile)">
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
    <modal-container />
    <toast-container />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, watchEffect, Ref } from 'vue'
import useHtmlDatasetBoolean from '/@/use/htmlDatasetBoolean'
import ToastContainer from '/@/components/Toast/ToastContainer.vue'
import ModalContainer from '/@/components/Modal/ModalContainer.vue'
import { useThemeVariables } from '/@/use/theme'
import { useResponsiveStore } from '/@/store/ui/responsive'
import { useBrowserSettings } from '/@/store/app/browserSettings'
import { useAppRtcStore } from '/@/store/app/rtc'
import { useTts } from '/@/store/app/tts'
import { useThemeSettings } from '/@/store/app/themeSettings'

const useQallConfirmer = () => {
  const { isCurrentDevice } = useAppRtcStore()
  window.addEventListener('beforeunload', event => {
    if (isCurrentDevice.value) {
      const unloadMessage = 'Qall中ですが本当に終了しますか？'
      event.preventDefault()
      event.returnValue = unloadMessage
      return unloadMessage
    }
  })
}

const useThemeObserver = () => {
  const { currentTheme } = useThemeSettings()
  const themeColor = computed(() => currentTheme.value.browser.themeColor)

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const $themeColor = document.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]'
  )!
  $themeColor.content = themeColor.value

  watchEffect(() => {
    if ($themeColor.content !== themeColor.value) {
      $themeColor.content = themeColor.value
    }
  })

  const codeHighlight = computed(
    () => currentTheme.value.markdown.codeHighlight === 'dark'
  )
  useHtmlDatasetBoolean('codeHighlight', codeHighlight)

  const stampEdge = computed(() => currentTheme.value.specific.stampEdgeEnable)
  useHtmlDatasetBoolean('stampEdge', stampEdge)
}

const useEcoModeObserver = () => {
  const { ecoMode } = useBrowserSettings()
  useHtmlDatasetBoolean('ecoMode', ecoMode)
}

const useThemeStyleTag = (style: Ref<Record<string, string>>) => {
  const styleText = computed(
    () =>
      `:root {
${Object.entries(style.value)
  .map(([key, value]) => `${key}:${value}`)
  .join(';')}
}`
  )

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const themeStyleTag = document.getElementById('theme-style')!
  watchEffect(() => {
    themeStyleTag.textContent = styleText.value
  })
}

export default defineComponent({
  name: 'App',
  components: {
    ModalContainer,
    ToastContainer
  },
  setup() {
    useTts()

    const { isMobile } = useResponsiveStore()

    useQallConfirmer()

    useThemeObserver()
    useEcoModeObserver()

    const themeVariables = useThemeVariables()
    useThemeStyleTag(themeVariables)

    return { isMobile }
  }
})
</script>

<style lang="scss">
@import 'src/styles/global.scss';
</style>

<style lang="scss" module>
.app {
  @include background-secondary;
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
}
</style>
