import { createComponent, SetupContext, reactive } from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'
import store from '@/store'
import styled, { ThemedProps } from 'vue-styled-components'
import theme from '@/lib/theme'
import media from '@/lib/media'

type Props = {
  channelId: ChannelId
}

export default createComponent({
  name: 'MessagesView',
  props: { channelId: String },
  setup(props: Props, _: SetupContext) {
    return () => (
      <Block>
        <Header poyo>
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
        <pre>Channel Id: {props.channelId}</pre>
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

const Header = styled('h1', { poyo: Boolean })`
  font: {
    size: 30px;
    weight: bold;
  }
  color: ${theme.accent.primary};
  background-color: ${props => (props.poyo ? 'red' : 'blue')};
`

const Block = styled.div`
  background-color: ${theme.accent.online};
  ${media.mobile`
    background-color: ${theme.accent.notification}
  `};
`
