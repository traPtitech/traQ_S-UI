declare module 'vue-styled-components' {
  import * as CSS from 'csstype'
  import * as Vue from 'vue'
  import { ComponentRenderProxy } from '@vue/composition-api'

  type CSSProperties = CSS.Properties<string | number>

  type CSSPseudos = { [K in CSS.Pseudos]?: CSSObject }

  interface CSSObject extends CSSProperties, CSSPseudos {
    [key: string]: CSSObject | string | number | undefined
  }

  type CSS = CSSProperties

  type StyledComponent<P> = Vue.Component<{}, {}, {}, P> &
    Vue.VueConstructor & {
      extend(
        cssRules: TemplateStringsArray,
        ...interpolate: Interpolation<P>[]
      ): StyledComponent<P>
      withComponent(target: Vue.VueConstructor): StyledComponent<P>
    }

  type StyledComponentElements<T = HTMLElements> = {
    [k in keyof T]: <P>(
      str: TemplateStringsArray,
      ...args: Interpolation<P>[]
    ) => StyledComponent<P>
  }
  type Styled<T = HTMLElements> = StyledComponentElements & {
    <Props extends Record<string, any>>(
      Component: keyof HTMLElements,
      props?: Props
    ): (
      str: TemplateStringsArray,
      ...args: ((props: ThemedProps<TypeOfProp<Props>>) => string)[]
    ) => StyledComponent<Props>
  }

  interface HTMLElements {
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

  export type Interpolation<P> = ((props: ThemedProps<P>) => string) | string

  export interface DefaultTheme {}
  export type ThemeProp = {
    theme: DefaultTheme
  }
  export type ThemedProps<P> = ThemeProp & P

  export type ThemeProviderComponent = {
    new (): ComponentRenderProxy<ThemeProp>
  }
  export const ThemeProvider: ThemeProviderComponent

  export const css: <P>(
    str: TemplateStringsArray,
    ...args: Interpolation<P>[]
  ) => string

  export let styled: Styled
  export default styled
}

type Primitify<T> = T extends String
  ? string
  : T extends Number
  ? number
  : T extends Boolean
  ? boolean
  : T extends BigInt
  ? bigint
  : T extends Symbol
  ? symbol
  : T

type TypeOfProp<P> = {
  [K in keyof P]: P[K] extends new (...args: any) => any
    ? Primitify<InstanceType<P[K]>>
    : P[K]
}
