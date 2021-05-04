export type Config = Readonly<{
  /**
   * Firebase用設定
   */
  firebase: Readonly<{
    apiKey: string
    appId: string
    projectId: string
    messagingSenderId: string
  }>
  /**
   * skyway用設定
   * 省略時はQall機能を無効化
   */
  skyway?: Readonly<{
    apiKey: string
  }>
  /**
   * アプリ一覧に表示されるサービス
   * 省略時はアプリ一覧ボタンを非表示にする
   */
  services?: ReadonlyArray<{
    /**
     * 表示名
     */
    label: string
    /**
     * `/img/services`からのアイコンへのパス(拡張子含む)
     */
    iconPath: string
    /**
     * リンク先
     */
    appLink: string
  }>
  /**
   * OGPが表示されないようにするホスト
   */
  ogpIgnoreHostNames: readonly string[]
  /**
   * Wikiのユーザーページへのリンク
   * undefinedにするとリンクが表示されない
   */
  wikiPageOrigin: string | undefined
  auth: Readonly<{
    /**
     * ログイン画面での「パスワードを忘れた」のリンク
     * undefinedにするとリンクが表示されない
     */
    resetLink: string | undefined
    /**
     * 設定画面での「パスワードは～から可能です」のリンク
     * undefinedにするとリンクが表示されない
     */
    changeLink: string | undefined
    /**
     * 設定画面での「パスワードは～から可能です」の「～」の表示
     * undefinedにするとリンクが表示されない
     */
    changeName: string | undefined
  }>
  /**
   * 内部用認証機構へのリダイレクト
   * 通常は`false`
   */
  pipelineEnabled: boolean
  /**
   * チャンネル変更権限をもっていないユーザーでも
   * チャンネル作成時に親チャンネルとしてrootを選択可能にする
   * サーバーでははじいていないので、APIをたたけば誰でも可能
   */
  isRootChannelSelectableAsParentChannel: boolean
  /**
   * QRコード表示ボタンの有効化
   */
  showQrCodeButton: boolean
  /**
   * 大きなファイルサイズのファイルを送信した際に表示されるメッセージ
   * `%s`の部分には「画像」または「ファイル」が入る
   */
  tooLargeFileMessage: string
  /**
   * iframe埋め込みウィジェットのコピーボタンの有効化
   * 同じドメインの/widget/以下にtraQ-Widgetがデプロイされていることが前提
   */
  showWidgetCopyButton: boolean
}>

declare global {
  interface Window {
    traQConfig: Config
  }
}
