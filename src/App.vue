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
import store from '/@/vuex'
import useHtmlDatasetBoolean from '/@/use/htmlDatasetBoolean'
import ToastContainer from '/@/components/Toast/ToastContainer.vue'
import { provideToastStore } from '/@/providers/toastStore'
import { provideStampPickerStore } from '/@/providers/stampPicker'
import { provideMessageInputState } from '/@/providers/messageInputState'
import { provideCommandPaletteStore } from '/@/providers/commandPalette'
import ModalContainer from '/@/components/Modal/ModalContainer.vue'
import { useThemeVariables } from '/@/use/theme'
import { useResponsiveStore } from '/@/store/ui/responsive'
import { useBrowserSettings } from '/@/store/app/browserSettings'

const useQallConfirmer = () => {
  window.addEventListener('beforeunload', event => {
    if (store.getters.app.rtc.isCurrentDevice) {
      const unloadMessage = 'Qall中ですが本当に終了しますか？'
      event.preventDefault()
      event.returnValue = unloadMessage
      return unloadMessage
    }
  })
}

const useThemeObserver = () => {
  const themeColor = computed(
    () => store.getters.app.themeSettings.currentTheme.browser.themeColor
  )

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
    () =>
      store.getters.app.themeSettings.currentTheme.markdown.codeHighlight ===
      'dark'
  )
  useHtmlDatasetBoolean('codeHighlight', codeHighlight)

  const stampEdge = computed(
    () => store.getters.app.themeSettings.currentTheme.specific.stampEdgeEnable
  )
  useHtmlDatasetBoolean('stampEdge', stampEdge)
}

const useEcoModeObserver = () => {
  const { ecoMode } = useBrowserSettings()
  useHtmlDatasetBoolean('ecoMode', ecoMode)
}

const useOsDarkTheme = () => {
  const queryList = window.matchMedia('(prefers-color-scheme: dark)')

  store.commit.app.themeSettings.setIsOsDarkTheme(queryList.matches)

  // safariではaddEventListener('change', func)が未対応なため
  queryList.addListener((event: MediaQueryListEvent) => {
    store.commit.app.themeSettings.setIsOsDarkTheme(event.matches)
  })
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
    provideToastStore()
    provideStampPickerStore()
    provideMessageInputState()
    provideCommandPaletteStore()

    const { isMobile } = useResponsiveStore()

    useQallConfirmer()

    useThemeObserver()
    useEcoModeObserver()
    useOsDarkTheme()

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
