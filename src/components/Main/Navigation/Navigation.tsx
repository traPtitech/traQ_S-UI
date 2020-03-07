import { createComponent } from '@vue/composition-api'
import NavigationContent from '@/components/Main/Navigation/NavigationContent'
import NavigationSelector from '@/components/Main/Navigation/NavigationSelector'
import styled from 'vue-styled-components'
import theme from '@/lib/theme'

export default createComponent({
  name: 'Navigation',
  setup() {
    return () => (
      <Wrapper>
        <NavigationSelector />
        <NavigationContent />
      </Wrapper>
    )
  }
})

const Wrapper = styled.div`
  width: 320px;
  flex-shrink: 0;
  height: 100vh;
  background: ${theme.background.secondary};
  overflow: scroll;
`
