declare module 'vue-styled-components' {
  import * as CSS from 'csstype'
  import * as Vue from 'vue'
  import { ComponentRenderProxy } from '@vue/composition-api'

  export type CSSProperties = CSS.Properties<string | number>

  export type CSSPseudos = { [K in CSS.Pseudos]?: CSSObject }

  export interface CSSObject extends CSSProperties, CSSPseudos {
    [key: string]: CSSObject | string | number | undefined
  }

  export type CSS = CSSProperties

  export type StyledComponent = Vue.Component &
    Vue.VueConstructor & {
      extend(
        cssRules: TemplateStringsArray,
        ...interpolate: TemplateStringsArray[]
      ): StyledComponent
      withComponent(target: Vue.VueConstructor): StyledComponent
    }

  export type StyledComponentElements<T = HTMLElements> = {
    [k in keyof T]: (
      str: TemplateStringsArray,
      ...args: ((props: PropsWithDefaultTheme) => string)[]
    ) => StyledComponent
  }
  export type Styled<T = HTMLElements> = StyledComponentElements & {
    <T>(Component: T, props?: Record<string, Vue.PropOptions['type']>): (
      str: TemplateStringsArray,
      ...args: ((props: PropsWithDefaultTheme) => string)[]
    ) => StyledComponent
  }

  export interface HTMLElements {
    a: HTMLAnchorElement
    abbr: HTMLElement
    address: HTMLElement
    area: HTMLAreaElement
    article: HTMLElement
    aside: HTMLElement
    audio: HTMLAudioElement
    b: HTMLElement
    base: HTMLBaseElement
    bdi: HTMLElement
    bdo: HTMLElement
    big: HTMLElement
    blockquote: HTMLElement
    body: HTMLBodyElement
    br: HTMLBRElement
    button: HTMLButtonElement
    canvas: HTMLCanvasElement
    caption: HTMLElement
    cite: HTMLElement
    code: HTMLElement
    col: HTMLTableColElement
    colgroup: HTMLTableColElement
    data: HTMLElement
    datalist: HTMLDataListElement
    dd: HTMLElement
    del: HTMLElement
    details: HTMLElement
    dfn: HTMLElement
    dialog: HTMLDialogElement
    div: HTMLDivElement
    dl: HTMLDListElement
    dt: HTMLElement
    em: HTMLElement
    embed: HTMLEmbedElement
    fieldset: HTMLFieldSetElement
    figcaption: HTMLElement
    figure: HTMLElement
    footer: HTMLElement
    form: HTMLFormElement
    h1: HTMLHeadingElement
    h2: HTMLHeadingElement
    h3: HTMLHeadingElement
    h4: HTMLHeadingElement
    h5: HTMLHeadingElement
    h6: HTMLHeadingElement
    head: HTMLElement
    header: HTMLElement
    hgroup: HTMLElement
    hr: HTMLHRElement
    html: HTMLHtmlElement
    i: HTMLElement
    iframe: HTMLIFrameElement
    img: HTMLImageElement
    input: HTMLInputElement
    ins: HTMLModElement
    kbd: HTMLElement
    keygen: HTMLElement
    label: HTMLLabelElement
    legend: HTMLLegendElement
    li: HTMLLIElement
    link: HTMLLinkElement
    main: HTMLElement
    map: HTMLMapElement
    mark: HTMLElement
    menu: HTMLElement
    menuitem: HTMLElement
    meta: HTMLMetaElement
    meter: HTMLElement
    nav: HTMLElement
    noscript: HTMLElement
    object: HTMLObjectElement
    ol: HTMLOListElement
    optgroup: HTMLOptGroupElement
    option: HTMLOptionElement
    output: HTMLElement
    p: HTMLParagraphElement
    param: HTMLParamElement
    picture: HTMLElement
    pre: HTMLPreElement
    progress: HTMLProgressElement
    q: HTMLQuoteElement
    rp: HTMLElement
    rt: HTMLElement
    ruby: HTMLElement
    s: HTMLElement
    samp: HTMLElement
    script: HTMLScriptElement
    section: HTMLElement
    select: HTMLSelectElement
    small: HTMLElement
    source: HTMLSourceElement
    span: HTMLSpanElement
    strong: HTMLElement
    style: HTMLStyleElement
    sub: HTMLElement
    summary: HTMLElement
    sup: HTMLElement
    table: HTMLTableElement
    tbody: HTMLTableSectionElement
    td: HTMLTableDataCellElement
    textarea: HTMLTextAreaElement
    tfoot: HTMLTableSectionElement
    th: HTMLTableHeaderCellElement
    thead: HTMLTableSectionElement
    time: HTMLElement
    title: HTMLTitleElement
    tr: HTMLTableRowElement
    track: HTMLTrackElement
    u: HTMLElement
    ul: HTMLUListElement
    var: HTMLElement
    video: HTMLVideoElement
    wbr: HTMLElement
  }

  export let styled: Styled

  export default styled

  interface DefaultTheme {
    primary: string
  }
  export type PropsWithDefaultTheme = {
    theme: DefaultTheme
  }
  export type ThemeProviderComponent = {
    new (): ComponentRenderProxy<PropsWithDefaultTheme>
  }
  export const ThemeProvider: ThemeProviderComponent
}
