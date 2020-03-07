import { createComponent, SetupContext, reactive } from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'
import store from '@/store'
import styled, { ThemedProps } from 'vue-styled-components'
import theme from '@/lib/theme'
import media from '@/lib/media'
import { Constructorize } from '@/types/utils'

type Props = {
  channelId: ChannelId
}

export default createComponent({
  name: 'MessagesView',
  props: { channelId: String },
  setup(props: Props, _: SetupContext) {
    return () => (
      <Block>
        <Header
          poyo={{
            a: false
          }}>
          {props.channelId in store.state.entities.channels
            ? '#' + store.state.entities.channels[props.channelId].name
            : 'メッセージビュー'}
        </Header>
        <button onClick={() => store.commit.ui.mainView.setLayout('single')}>
          single layout
        </button>
        <button onClick={() => store.commit.ui.mainView.setLayout('split')}>
          split layout
        </button>
        <pre>Channel id: {props.channelId}</pre>
        {Object.values(store.state.entities.messages)
          .filter(m => m.parentChannelId === props.channelId)
          .sort(m => m.createdAt?.valueOf() ?? 0)
          .map(m => (
            <div>{m.content}</div>
          ))}
      </Block>
    )
  }
})

const HeaderProps = { poyo: Object as Constructorize<{ a: boolean }> }

const Header = styled('h1', HeaderProps)`
  font: {
    size: 30px;
    weight: bold;
  }
  color: ${theme.accent.primary};
  background-color: ${props => (props.poyo.a ? 'red' : 'blue')};
`

const Block = styled.div`
  height: 100vh;
  overflow: scroll;
  background-color: ${theme.accent.online};
  ${media.mobile`
    background-color: ${theme.accent.notification}
  `};
`
