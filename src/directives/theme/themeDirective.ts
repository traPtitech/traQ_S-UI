import Vue from 'vue'
import { Theme } from '@/types/theme'
import { DirectiveBinding } from 'vue/types/options'
import { VNode } from 'vue/types/umd'

interface ThemeValue {
  [propertyName: string]: string
}

interface ThemeBinding extends DirectiveBinding {
  value?: (theme: Theme) => ThemeValue
}

const bind: Vue.DirectiveFunction = (
  el: HTMLElement,
  binding: ThemeBinding,
  vnode: VNode,
  oldVNode: VNode
) => {
  if (!binding.value) return

  const styles: ThemeValue = binding.value(vnode)
  // Object.keys(styles).forEach((styleProperty: string) => {
  //   ;(el.style as any)[styleProperty] = styles[styleProperty]
  // })
}

const unbind: Vue.DirectiveFunction = (
  el: HTMLElement,
  binding: ThemeBinding,
  vnode: VNode,
  oldVNode: VNode
) => {}

const ThemeDirective: Vue.DirectiveOptions = {
  bind,
  unbind
}

export default ThemeDirective
