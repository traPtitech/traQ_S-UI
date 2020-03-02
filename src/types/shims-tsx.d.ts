import Vue, { VNode } from 'vue'
import { ComponentRenderProxy } from '@vue/composition-api'

import * as base from 'vue-tsx-support/types/base'
import * as builtin from 'vue-tsx-support/types/builtin-components'
import 'vue-tsx-support/types/vue'

declare global {
  namespace JSX {
    interface Element extends VNode {}
    interface ElementClass extends ComponentRenderProxy {}
    interface ElementAttributesProperty {
      $props: any // specify the property name to use
    }

    // NOTE: DOM用にvue-tsx-supportの型定義を使用
    //       公式の使用方法とは異なることに注意
    interface IntrinsicElements extends base.IntrinsicElements {
      // allow unknown elements
      [name: string]: any

      // builtin components
      transition: base.TsxComponentAttrs<builtin.TransitionProps>
      'transition-group': base.TsxComponentAttrs<builtin.TransitionGroupProps>
      'keep-alive': base.TsxComponentAttrs<builtin.KeepAliveProps>
    }
  }
}
