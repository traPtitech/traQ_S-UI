interface DataAndAriaAttributes {
  [dataAttr: `data${UppercaseAlphabet}${string}`]: unknown
  [dataAttr: `data-${string}`]: unknown
  [ariaAttr: `aria${UppercaseAlphabet}${string}`]: unknown
  [ariaAttr: `aria-${string}`]: unknown
}

declare module '@vue/runtime-dom' {
  interface HTMLAttributes extends DataAndAriaAttributes {
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/enterkeyhint
    enterkeyhint?: string
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type
  interface SVGAttributes extends DataAndAriaAttributes {}
  interface ImgHTMLAttributes extends HTMLAttributes {
    loading?: 'lazy' | 'eager' | 'auto'
  }
}

declare module '@vue/runtime-core' {
  interface AllowedComponentProps extends DataAndAriaAttributes {
    title?: string
    id?: string
  }
}

type UppercaseAlphabet =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'O'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
  | 'U'
  | 'V'
  | 'W'
  | 'X'
  | 'Y'
  | 'Z'

export {}
