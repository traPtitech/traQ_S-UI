import { createComponent } from '@vue/composition-api'
import store from '@/store'
import { LayoutType, ViewInformation } from '@/store/ui/mainView/state'
import { VNode } from 'vue'

import MessagesView from '@/components/Main/MainView/MessagesView'
import QallView from '@/components/Main/MainView/QallView'

/**
 * ビューを選んで描画する
 * @param viewInfo 描画したいビューの情報
 */
const selectView = (viewInfo?: ViewInformation) => {
  if (viewInfo?.type === 'messages') {
    return () => <MessagesView channelId={store.state.app.currentChannelId} />
  }
  if (viewInfo?.type === 'qall') {
    return () => <QallView />
  }
  return () => <div class="view-none"></div>
}

/**
 * VNodeをレイアウトにしたがって描画する
 * @param layoutType レイアウト種別
 * @param primaryView 主ビュー
 * @param secondaryView サブビュー
 */
const renderLayout = (
  layoutType: LayoutType,
  primaryView: () => VNode,
  secondaryView?: () => VNode
) => {
  return (
    <div class={`layout-${layoutType}`}>
      <div class="layout__primary">{primaryView()}</div>
      {layoutType !== 'single' && secondaryView ? (
        <div class="layout__secondary">{secondaryView()}</div>
      ) : null}
    </div>
  )
}

export default createComponent({
  name: 'MainViewController',
  setup() {
    return () => (
      <div class="main-view-controller">
        {renderLayout(
          store.state.ui.mainView.layout,
          selectView(store.state.ui.mainView.primaryView),
          selectView(store.state.ui.mainView.secondaryView)
        )}
      </div>
    )
  }
})
