import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import { commonStyles } from '/@/lib/styles'
import { useThemeSettings } from '/@/store/app/themeSettings'

export const useThemeVariables = (): ComputedRef<
  Record<`--${string}`, string>
> => {
  const { currentTheme } = useThemeSettings()
  return computed(() => {
    const theme = currentTheme.value
    const common = commonStyles
    return {
      '--theme-accent-primary-default': theme.basic.accent.primary.default,
      '--theme-accent-primary-background':
        theme.basic.accent.primary.background,
      '--theme-accent-notification-default':
        theme.basic.accent.notification.default,
      '--theme-accent-notification-background':
        theme.basic.accent.notification.background,
      '--theme-accent-online-default': theme.basic.accent.online.default,
      '--theme-accent-error-default': theme.basic.accent.error.default,
      '--theme-accent-focus-default': theme.basic.accent.focus.default,
      '--theme-background-primary-default':
        theme.basic.background.primary.default,
      '--theme-background-primary-border':
        theme.basic.background.primary.border,
      '--theme-background-secondary-default':
        theme.basic.background.secondary.default,
      '--theme-background-secondary-border':
        theme.basic.background.secondary.border,
      '--theme-background-tertiary-default':
        theme.basic.background.tertiary.default,
      '--theme-background-tertiary-border':
        theme.basic.background.tertiary.border,
      '--theme-ui-primary-default': theme.basic.ui.primary.default,
      '--theme-ui-primary-background': theme.basic.ui.primary.background,
      '--theme-ui-primary-inactive': theme.basic.ui.primary.inactive,
      '--theme-ui-secondary-default': theme.basic.ui.secondary.default,
      '--theme-ui-secondary-background': theme.basic.ui.secondary.background,
      '--theme-ui-secondary-inactive': theme.basic.ui.secondary.inactive,
      '--theme-ui-tertiary-default': theme.basic.ui.tertiary.default,
      '--theme-text-primary-default': theme.basic.text.primary.default,
      '--theme-text-secondary-default': theme.basic.text.secondary.default,

      '--specific-waveform-color': theme.specific.waveformColor,
      '--specific-waveform-gradation': theme.specific.waveformGradation,
      '--specific-navigation-bar-desktop-background':
        theme.specific.navigationBarDesktopBackground,
      '--specific-navigation-bar-mobile-background':
        theme.specific.navigationBarMobileBackground,
      '--specific-main-view-background': theme.specific.mainViewBackground,
      '--specific-side-bar-background': theme.specific.sideBarBackground,
      '--specific-channel-hash-opened': theme.specific.channelHashOpened,
      '--specific-channel-unread-badge-text':
        theme.specific.channelUnreadBadgeText,
      '--specific-message-hover-background':
        theme.specific.messageHoverBackground,
      '--specific-stamp-include-me-background':
        theme.specific.stampIncludeMeBackground,
      '--specific-count-text': theme.specific.stampCountText,
      '--specific-stamp-picker-opener-border':
        theme.specific.stampPickerOpenerBorder,
      '--specific-loading-spinner-gap-ui-secondary':
        theme.specific.loadingSpinnerGapUiSecondary,
      '--specific-loading-spinner-gap-accent-primary':
        theme.specific.loadingSpinnerGapAccentPrimary,
      '--specific-slider-background': theme.specific.sliderBackground,

      '--color-scheme': theme.browser.colorScheme,
      '--selection-text': theme.browser.selectionText,
      '--selection-background': theme.browser.selectionBackground,
      '--caret': theme.browser.caret ?? 'unset',
      '--scrollbar-color': theme.browser.scrollbarThumb,
      '--scrollbar-hover-color': theme.browser.scrollbarThumbHover,
      '--scrollbar-track-color': theme.browser.scrollbarTrack,

      '--markdown-link-text': theme.markdown.linkText,
      '--markdown-hr-text': theme.markdown.hrText,
      '--markdown-h6-text': theme.markdown.h6Text,
      '--markdown-quote-text': theme.markdown.quoteText,
      '--markdown-quote-bar': theme.markdown.quoteBar,
      '--markdown-code-background': theme.markdown.codeBackground,
      '--markdown-code-file-name-background':
        theme.markdown.codeFileNameBackground,
      '--markdown-table-td-border': theme.markdown.tableTdBorder,
      '--markdown-table-tr-border': theme.markdown.tableTrBorder,
      '--markdown-table-tr-background': theme.markdown.tableTrBackground,
      '--markdown-table-tr-background2': theme.markdown.tableTrBackground2,
      '--markdown-img-background': theme.markdown.imgBackground,
      '--markdown-mark-text': theme.markdown.markText,
      '--markdown-mark-background': theme.markdown.markBackground,
      '--markdown-spoiler-background': theme.markdown.spoilerBackground,
      '--markdown-spoiler-shown-background':
        theme.markdown.spoilerShownBackground,
      '--markdown-embed-link-text': theme.markdown.embedLinkText,
      '--markdown-embed-link-background': theme.markdown.embedLinkBackground,
      '--markdown-embed-link-highlight-text':
        theme.markdown.embedLinkHighlightText,
      '--markdown-embed-link-highlight-background':
        theme.markdown.embedLinkHighlightBackground,

      '--common-text-white-primary': common.text.whitePrimary,
      '--common-text-white-secondary': common.text.whiteSecondary,
      '--common-text-black': common.text.black,
      '--common-ui-qall': common.ui.qall,
      '--common-ui-muted': common.ui.muted,
      '--common-ui-pin': common.ui.pin,
      '--common-background-overlay': common.background.overlay,
      '--common-background-black': common.background.black,
      '--common-background-pin': common.background.pin,
      '--common-drop-shadow-default': common.dropShadow.default
    }
  })
}
