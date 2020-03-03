import { createComponent, SetupContext } from '@vue/composition-api'
import styled from 'vue-styled-components'

export default createComponent({
  name: 'QallView',
  props: {},
  setup() {
    return () => (
      <Block>
        <Header>Qallビュー</Header>
      </Block>
    )
  }
})

const Header = styled.h1`
  font: {
    size: 30px;
    weight: bold;
  }
  color: green;
`

const Block = styled.div`
  color: green;
`
