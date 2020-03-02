import { createComponent, SetupContext, reactive } from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'
import store from '@/store'
import styled from 'vue-styled-components'

type Props = {
  channelId: ChannelId
}

export default createComponent({
  name: 'MessagesView',
  props: { channelId: String },
  setup(props: Props, _: SetupContext) {
    return () => (
      <Block>
        <Header>
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

const Header = styled.h1`
  font: {
    size: 30px;
    weight: bold;
  }
  color: ${props => props.theme.primary};
`

const Block = styled.div`
  color: blue;
`
