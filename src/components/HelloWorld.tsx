import { createComponent, SetupContext } from '@vue/composition-api'
import styled from 'vue-styled-components'
import style from './HelloWorld.module.scss'

type Props = {
  msg: string
}

export default createComponent({
  name: 'HelloWorld',
  props: { msg: String },
  setup(props: Props, context: SetupContext) {
    return () => (
      <div class={style.title}>
        <Header>{props.msg}</Header>
      </div>
    )
  }
})

const Header = styled.h1`
  font: {
    size: 30px;
    weight: bold;
  }
  color: red;
`
