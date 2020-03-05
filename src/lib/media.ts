import { css, ThemedProps, Interpolation } from 'vue-styled-components'

/*
 * Bootstrap Media Queries
 *
 *           ex-small < 576px  : portrait phones
 * 576px  <= small    < 768px  : landscape phones
 * 768px  <= medium   < 992px  : tablets
 * 992px  <= large    < 1200px : desktops
 * 1200px <= ex-large          : large desktops
 */

export const minBreakpoints = {
  small: 576,
  medium: 768,
  large: 992,
  exLarge: 1200
}
export const maxBreakpoints = {
  exSmall: minBreakpoints.small - 0.02,
  small: minBreakpoints.medium - 0.02,
  medium: minBreakpoints.large - 0.02,
  large: minBreakpoints.exLarge - 0.02
}

export const mobileMaxBreakpoint = maxBreakpoints.small

const mobile = (query: TemplateStringsArray, ctx: Interpolation<{}>) => (
  _: ThemedProps<{}>
) =>
  css`
    [data-is-mobile='true'] & {
      ${css(query, ctx)}
    }
  `

const media = {
  mobile
}

export default media
