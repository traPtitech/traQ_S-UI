export default {
  /**
   * Firebase用設定
   *
   * sw.jsの変更も必要です
   */
  firebase: {
    apiKey: 'AIzaSyDee_VkrRtByJCrCZAX3nTSDPl8AaHlWfY',
    authDomain: 'traq-r.firebaseapp.com',
    databaseURL: 'https://traq-r.firebaseio.com',
    projectId: 'traq-r',
    storageBucket: 'traq-r.appspot.com',
    messagingSenderId: '993645413001',
    appId: '1:993645413001:web:b253ea3776d6cf85163c58'
  },
  /**
   * skyway用設定
   */
  skyway: {
    apiKey: '55fd6e68-6e1b-492b-b57d-df0273c6e217'
  },
  /**
   * 表示されるサービス
   *
   * iconNameは`src/assets/icons`からのパス
   */
  services: [
    {
      label: 'Portal',
      iconName: 'services/portal',
      appLink: 'https://portal.trap.jp/'
    },
    {
      label: 'Official Website',
      iconName: 'services/traP',
      appLink: 'https://trap.jp/'
    },
    {
      label: 'Wiki',
      iconName: 'services/growi',
      appLink: 'https://wiki.trap.jp/'
    },
    {
      label: 'Blog',
      iconName: 'services/ghost',
      appLink: 'https://blog-admin.trap.jp/'
    },
    {
      label: 'Drive',
      iconName: 'services/nextcloud',
      appLink: 'https://drive.trap.jp/'
    },
    {
      label: 'Git',
      iconName: 'services/gitea',
      appLink: 'https://git.trap.jp/'
    },
    {
      label: 'Showcase',
      iconName: 'services/showcase',
      appLink: 'https://showcase.trapti.tech/'
    },
    {
      label: 'HackMD',
      iconName: 'services/hackmd',
      appLink: 'https://md.trap.jp/'
    },
    {
      label: 'anke-to',
      iconName: 'services/anke-to',
      appLink: 'https://anke-to.trap.jp/'
    },
    {
      label: 'booQ',
      iconName: 'services/booq',
      appLink: 'https://booq.trap.jp/'
    },
    {
      label: 'knoQ',
      iconName: 'services/knoq',
      appLink: 'https://knoq.trap.jp/'
    },
    {
      label: 'BOT Console',
      iconName: 'services/bot-console',
      appLink: 'https://bot-console.trap.jp/'
    },
    {
      label: 'Jomon',
      iconName: 'services/jomon',
      appLink: 'https://jomon.trap.jp/'
    }
  ],
  /**
   * OGPが表示されないようにするホスト
   */
  ogpIgnoreHostNames: [
    'wiki.trap.jp',
    'git.trap.jp',
    'md.trap.jp',
    'drive.trap.jp',
    'anke-to.trap.jp',
    'booq.trap.jp',
    'knoq.trap.jp',
    'wiki.trapti.tech',
    'git.trapti.tech',
    'md.trapti.tech',
    'drive.trapti.tech',
    'showcase.trapti.tech',
    'jomon.trap.jp'
  ],
  /**
   * Wikiのユーザーページへのリンク
   * undefinedにするとリンクが表示されない
   */
  wikiPageOrigin: 'https://wiki.trap.jp',
  auth: {
    /**
     * ログイン画面での「パスワードを忘れた」のリンク
     * undefinedにするとリンクが表示されない
     */
    resetLink: 'https://portal.trap.jp/reset-password',
    /**
     * 設定画面での「パスワードは～から可能です」のリンク
     * undefinedにするとリンクが表示されない
     */
    changeLink: 'https://portal.trap.jp',
    /**
     * 設定画面での「パスワードは～から可能です」の「～」の表示
     * undefinedにするとリンクが表示されない
     */
    changeName: 'traPortal',
    /**
     * 登録画面や登録画面へのリンクを表示する
     * サーバーの設定も必要
     */
    showRegistration: false
  },
  /**
   * 内部用認証機構へのリダイレクト
   * 通常は`false`
   */
  pipelineEnabled: true,
  /**
   * チャンネル変更権限をもっていないユーザーでも
   * チャンネル作成時に親チャンネルとしてrootを選択可能にする
   * サーバーでははじいていないので、APIをたたけば誰でも可能
   */
  isRootChannelSelectableAsParentChannel: false,
  /**
   * QRコード表示ボタンの有効化
   */
  showQrCodeButton: true,
  /**
   * 大きなファイルサイズのファイルを送信した際に表示されるメッセージ
   * `%s`の部分には「画像」または「ファイル」が入る
   */
  tooLargeFileMessage: '大きい%sの共有にはDriveを使用してください',
  /**
   * iframe埋め込みウィジェットのコピーボタンの有効化
   * 同じドメインの/widget/以下にtraQ-Widgetがデプロイされていることが前提
   */
  showWidgetCopyButton: true
} as const
