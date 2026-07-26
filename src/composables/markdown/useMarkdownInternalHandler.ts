import { useRouter } from 'vue-router'

import { useOpenLink } from '/@/composables/useOpenLink'
import { embeddingOrigin } from '/@/lib/apis'
import { toggleSpoiler } from '/@/lib/markdown/spoiler'
import { RouteName } from '/@/router'

type HTMLElementTargetMouseEvent = MouseEvent & { target: HTMLElement }

const useMarkdownInternalHandler = () => {
  const { origin } = new URL(embeddingOrigin)
  const router = useRouter()
  const { shouldOpenWithRouter } = useOpenLink()

  const onClick = (event: MouseEvent) => {
    if (!event.target) return
    const e = event as HTMLElementTargetMouseEvent

    toggleSpoilerHandler(e)
    internalLinkClickHandler(e)
  }

  const toggleSpoilerHandler = (event: HTMLElementTargetMouseEvent) => {
    const toggled = toggleSpoiler(event.target)
    if (toggled) {
      event.stopPropagation()
    }
  }

  // チャンネルのリンク(a.message-channel-link)もこれで処理される
  const internalLinkClickHandler = (event: HTMLElementTargetMouseEvent) => {
    const $a = event.target.closest<HTMLAnchorElement>('a[href]')
    if (!$a || $a.origin !== origin) return

    // markdown内でない場合(添付ファイルなど)は無視
    const $body = $a.closest('.markdown-body, .markdown-inline-body')
    if (!$body) return

    // 同じタブで開かない場合は無視
    if (!shouldOpenWithRouter(event)) return

    const linkPath = $a.pathname + $a.search + $a.hash

    const resolved = router.resolve(linkPath)
    // NotFoundだけが引っかかった場合、または何も引っかからなかった場合はフロントで処理するルートではない
    const isNotHandledWithRouter =
      resolved.matched.filter(m => m.name !== RouteName.NotFound).length === 0
    if (isNotHandledWithRouter) return

    event.preventDefault()
    event.stopPropagation()
    router.push(linkPath)
  }

  return { onClick }
}

export default useMarkdownInternalHandler
