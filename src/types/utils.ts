/**
 * Styled componentにpropとしてオブジェクトを渡す必要があるときに用いる
 *
 * ex: <Header poyo={{ a: true }}>shown as red</Header>
 *     ...
 *     const HeaderProps = { poyo: Object as Constructorize<{ a: boolean }> }
 *     const Header = styled('h1', HeaderProps)`
 *       color: ${props => (props.poyo.a ? 'red' : 'blue')};
 *     `
 */
export type Constructorize<T> = ObjectConstructor & {
  new (): T
}
