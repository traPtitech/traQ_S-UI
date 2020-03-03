import { createComponent } from '@vue/composition-api'
import { VNode } from 'vue'

type Props = {
  primaryView: () => VNode
}

export default createComponent({
  name: 'MessagesView',
  props: { primaryView: Function },
  setup(props: Props) {
    return () => <div class="layout-single">{props.primaryView()}</div>
  }
})
