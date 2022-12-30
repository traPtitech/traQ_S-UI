<template>
  <span
    ref="contentRef"
    class="markdown-body"
    :class="$style.content"
    v-html="content"
  />
</template>

<script lang="ts" setup>
import { onMounted, onUpdated, ref } from 'vue'

defineProps<{
  content: string
}>()

const contentRef = ref<HTMLElement>()

class FoldController {
  private static readonly maxLines = 6

  private controlledDoms: Array<{
    target: HTMLElement
    targetHandler: (e: Event) => void
    button: HTMLElement
    buttonHandler: (e: Event) => void
  }> = []

  /*
    convert from

    <pre> hoge </pre>

    to

    <div class="fold-wrap" data-is-fold="true">
      <pre> hoge </pre>
      <button class="fold-button">折りたたむ ↑</button>
      <button class="unfold-button">クリックして展開 ↓</button>
    </div>
  */

  private unfoldHandler(target: HTMLElement): (e: Event) => void {
    return e => {
      if (target.dataset['isFold'] !== 'true') return

      target.dataset['isFold'] = 'false'
      e.stopPropagation()
    }
  }

  private foldHandler(target: HTMLElement): (e: Event) => void {
    return e => {
      if (target.dataset['isFold'] !== 'false') return

      target.dataset['isFold'] = 'true'
      e.stopPropagation()
    }
  }

  private release() {
    this.controlledDoms.forEach(
      ({ target, targetHandler, button, buttonHandler }) => {
        target.removeEventListener('click', targetHandler)
        button.removeEventListener('click', buttonHandler)
      }
    )
    this.controlledDoms = []
  }

  public update(target: HTMLElement | undefined) {
    this.release()

    const pre_list = target?.querySelectorAll('pre')

    if (pre_list === undefined || pre_list.length === 0) return

    pre_list.forEach(pre => {
      {
        const code = pre.querySelector('code')
        if (code === null) return
        const codeText = code.textContent
        if (codeText === null) return

        const lines = codeText.split('\n').length

        if (lines <= FoldController.maxLines) return
      }

      const wrap = document.createElement('div')
      wrap.classList.add('fold-wrap')
      wrap.dataset['isFold'] = 'true'
      pre.parentNode?.insertBefore(wrap, pre)
      wrap.appendChild(pre)

      const wrapHandler = this.unfoldHandler(wrap)
      wrap.addEventListener('click', wrapHandler)

      const foldButton = document.createElement('button')
      foldButton.classList.add('fold-button')
      foldButton.textContent = '折りたたむ ↑'

      const foldButtonHandler = this.foldHandler(wrap)
      foldButton.addEventListener('click', foldButtonHandler)

      wrap.appendChild(foldButton)

      // 見た目だけのダミー
      const unfoldButton = document.createElement('button')
      unfoldButton.classList.add('unfold-button')
      unfoldButton.textContent = 'クリックして展開 ↓'
      wrap.appendChild(unfoldButton)

      this.controlledDoms.push({
        target: wrap,
        targetHandler: wrapHandler,
        button: foldButton,
        buttonHandler: foldButtonHandler
      })
    })
  }
}

const foldController = new FoldController()

onMounted(() => {
  foldController.update(contentRef.value)
})
onUpdated(() => {
  foldController.update(contentRef.value)
})
</script>

<style lang="scss" module>
.content {
  word-break: normal;
  overflow-wrap: break-word; // for Safari
  overflow-wrap: anywhere;
  line-break: loose;
}
</style>

<style lang="scss">
.markdown-body {
  div.fold-wrap {
    position: relative;
    overflow: hidden;
    &[data-is-fold='true'] {
      cursor: pointer;
      pre {
        max-height: calc(6em + 32px);
        -webkit-mask-image: linear-gradient(black 0% 40%, transparent 100%);
        mask-image: linear-gradient(black 0% 40%, transparent 100%);
      }
      box-shadow: 0 0 0 2px var(--markdown-code-background) inset;
    }

    button {
      display: block;
      cursor: pointer;
      position: absolute;
      bottom: 24px;
      margin: auto;
      left: 0;
      right: 0;
      background-color: $theme-ui-secondary-default;
      color: $theme-background-primary-default;
      border-radius: 9999999px;
      padding: 4px 12px;
      width: fit-content;

      transition: all 0.15s ease-out;
    }

    @media (hover: hover) {
      button {
        transform: translateY(calc(100% + 24px));
        opacity: 0;
      }

      &:hover {
        button {
          transform: translateY(0);
          opacity: 1;
        }
      }
    }

    &[data-is-fold='true'] {
      button.fold-button {
        display: none;
      }
    }
    &[data-is-fold='false'] {
      button.unfold-button {
        display: none;
      }
    }
  }
}
</style>
