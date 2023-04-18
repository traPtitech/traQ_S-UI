<template>
  <div :class="$style.container">
    <div v-if="iosAppFlag" :class="$style.iosAppIsDeprecated">
      {{ iosAppDeprecatedMessage }}
      <div v-if="iosPwaInfoLink">
        PWA版について:
        <a :href="iosPwaInfoLink" :class="$style.iosPwaInfoLink">{{
          iosPwaInfoLink
        }}</a>
      </div>
    </div>
    <div id="header" :class="$style.headerContainer"></div>
    <div :class="$style.layoutContainer" :data-layout="layout">
      <primary-view-selector :is-ready="isMounted" />
      <div id="sidebar-opener" :class="$style.hidden" />
      <secondary-view-selector v-if="layout !== 'single'" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useMainViewStore } from '/@/store/ui/mainView'
import PrimaryViewSelector from './PrimaryViewSelector.vue'
import SecondaryViewSelector from './SecondaryViewSelector.vue'
import { isIOSApp } from '/@/lib/dom/browser'

const iosAppFlag = isIOSApp(window)
const iosAppDeprecatedMessage =
  '現在お使いのiOSアプリ版traQは2023/04/01を以て廃止され、2023/06/01には動作しなくなります。引き続き利用するにはPWA版に移行してください。なお、PWA版は動作にiOS 16.4を要求します。'

const iosPwaInfoLink = window.traQConfig.iosPwaInfoLink

const { layout } = useMainViewStore()

const isMounted = ref(false)
onMounted(() => {
  isMounted.value = true
})
onBeforeUnmount(() => {
  isMounted.value = false
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
}

.iosAppIsDeprecated {
  @include color-common-text-white-primary;
  width: 100%;
  z-index: $z-index-header;
  padding: 16px;
  background-color: $theme-accent-error-default;
}

.iosPwaInfoLink {
  text-decoration: underline;
}

.headerContainer {
  width: 100%;
  z-index: $z-index-header;
}

.layoutContainer {
  position: relative;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;

  &[data-layout|='split'] {
    display: flex;
  }
  &[data-layout='split'] {
    flex-direction: column;
  }
  &[data-layout='split-reverse'] {
    flex-direction: column-reverse;
  }
}

.hidden {
  position: absolute;
  right: 0;
  top: 0;
  pointer-events: none;
}
</style>
