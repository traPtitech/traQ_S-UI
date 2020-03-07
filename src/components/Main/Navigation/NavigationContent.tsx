import { createComponent } from '@vue/composition-api'
import store from '@/store'

export default createComponent({
  name: 'NavigationContent',
  setup() {
    // デバッグ用
    store.dispatch.entities.fetchChannels()
    return () => (
      <div class="navigation-content">
        {Object.values(store.state.entities.channels).map(channel => (
          <div
            onClick={() => {
              store.commit.app.setCurrentChannelId(channel.channelId ?? '')
              store.dispatch.entities.fetchMessagesByChannelId(
                channel.channelId ?? ''
              )
            }}>
            {' '}
            #{channel.name}
          </div>
        ))}
      </div>
    )
  }
})
