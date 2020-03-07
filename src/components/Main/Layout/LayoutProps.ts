import { VNode } from 'vue'

export default interface LayoutProps {
  renderNavigation: () => VNode
  renderMainView: () => VNode
}
