import { ResolvedTheme } from '/@/lib/theme/resolve'

export type ThemeClaim<T> = (
  theme: Readonly<ResolvedTheme>,
  common: CommonStyles
) => T

/** テーマに依存しない色 */
export const commonStyles = {
  text: {
    whitePrimary: '#ffffff',
    whiteSecondary: 'rgba(255, 255, 255, 0.5)',
    black: '#222222'
  },
  ui: {
    qall: '#00ACA2',
    muted: '#F26451',
    pin: '#f2ba4a'
  },
  background: {
    overlay: 'rgba(25, 26, 29, 0.5)',
    black: '#22262A',
    pin: 'rgba(242, 186, 74, 0.2)'
  },
  dropShadow: {
    default: 'drop-shadow(0 2px 4px rgba(33, 63, 99, 0.3))'
  }
} as const
export type CommonStyles = typeof commonStyles
