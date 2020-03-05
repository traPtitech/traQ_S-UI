import { css, ThemedProps, Interpolation } from 'vue-styled-components'

export const mobile = (query: TemplateStringsArray, ctx: Interpolation<{}>) => (
  _: ThemedProps<{}>
) =>
  css`
    .is-mobile & {
      ${css(query, ctx)}
    }
  `

const media = {
  mobile
}

export default media
