import { createComponent } from '@vue/composition-api'
import styled from 'vue-styled-components'
import store from '@/store'

export default createComponent({
  name: 'NavigationContent',
  setup() {
    return () => (
      <Block class="navigation-content">
        <ul>
          {Object.values(store.state.entities.channels).map(channel => (
            <li
              onClick={() => {
                store.commit.app.setCurrentChannelId(channel.channelId ?? '')
                store.dispatch.entities.fetchMessagesByChannelId(
                  channel.channelId ?? ''
                )
              }}>
              {' '}
              #{channel.name}
            </li>
          ))}
        </ul>
      </Block>
    )
  }
})

const Block = styled.div`
  color: green;
  max-height: 100px;
  overflow: scroll;
`
