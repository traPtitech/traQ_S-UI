<template>
  <div :class="$style.app" :data-is-mobile="$boolAttr(isMobile)">
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
    <modal-container />
    <toast-container />
    <stamp-picker-container />
  </div>
</template>

<script lang="ts">
import type { Ref } from 'vue'
import { computed, watchEffect } from 'vue'
import useHtmlDataset from '/@/composables/document/useHtmlDataset'
import { useThemeVariables } from '/@/composables/document/useThemeVariables'
import { useResponsiveStore } from '/@/store/ui/responsive'
import { useBrowserSettings } from '/@/store/app/browserSettings'
import { useTts } from '/@/store/app/tts'
import { useThemeSettings } from '/@/store/app/themeSettings'
import useDocumentTitle from '/@/composables/document/useDocumentTitle'

const useQallConfirmer = () => {
  window.addEventListener('beforeunload', event => {
    // TODO: Qall
    // ここは適切な変数を置く
    const isCurrentDevice = computed(() => false)
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
    () => currentTheme.value.markdown.codeHighlight
  )
  useHtmlDataset('codeHighlight', codeHighlight)

  const stampEdge = computed(() => currentTheme.value.specific.stampEdgeEnable)
  useHtmlDataset('stampEdge', stampEdge)
}

const useEcoModeObserver = () => {
  const { ecoMode } = useBrowserSettings()
  useHtmlDataset('ecoMode', ecoMode)
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
</script>

<script lang="ts" setup>
import ToastContainer from '/@/components/Toast/ToastContainer.vue'
import ModalContainer from '/@/components/Modal/ModalContainer.vue'
import StampPickerContainer from '/@/components/Main/StampPicker/StampPickerContainer.vue'

useTts()

const { isMobile } = useResponsiveStore()

useDocumentTitle()
useQallConfirmer()

useThemeObserver()
useEcoModeObserver()

const themeVariables = useThemeVariables()
useThemeStyleTag(themeVariables)
</script>

<style lang="scss" module>
.app {
  @include background-secondary;
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
