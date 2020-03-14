import Vue from 'vue'
import ThemeDirective from './themeDirective'

const install: Vue.PluginFunction<never> = () => {
  Vue.directive('theme', ThemeDirective)
}

const VueTheme: Vue.PluginObject<never> = {
  install
}

export default VueTheme
