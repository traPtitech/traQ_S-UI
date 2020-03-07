import { createComponent } from '@vue/composition-api'
import LayoutProps from './LayoutProps'
import styled from 'vue-styled-components'

export default createComponent({
  name: 'DesktopLayout',
  props: {
    renderNavigation: Function,
    renderMainView: Function
  },
  setup(props: LayoutProps) {
    return () => (
      <DesktopLayoutWrapper>
        Desktop
        {props.renderNavigation()}
        {props.renderMainView()}
      </DesktopLayoutWrapper>
    )
  }
})

const DesktopLayoutWrapper = styled.div`
  display: flex;
`
