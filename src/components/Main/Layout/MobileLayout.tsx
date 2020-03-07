import { createComponent } from '@vue/composition-api'
import LayoutProps from './LayoutProps'
import styled from 'vue-styled-components'

export default createComponent({
  name: 'MobileLayout',
  props: {
    renderNavigation: Function,
    renderMainView: Function
  },
  setup(props: LayoutProps) {
    return () => (
      <MobileLayoutWrapper>
        Mobile
        {props.renderNavigation()}
        {props.renderMainView()}
      </MobileLayoutWrapper>
    )
  }
})

const MobileLayoutWrapper = styled.div`
  display: flex;
`
