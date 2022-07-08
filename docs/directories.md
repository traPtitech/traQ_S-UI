# ディレクトリ構造

- src: ソースコード
  - lib: 汎用ロジック
    - basic: DOM に依存しない(ECMAScript で収まる)純粋な JS の関数
    - dom: DOM に依存する traQ のロジックの含まれない関数
    - その他はごちゃごちゃ
  - composables
    - utils: 汎用 composable
    - dom: DOM に大きく依存する composable
    - その他はごちゃごちゃ
  - components
    - Authenticate: ログイン画面周り
    - GroupManager: グループ管理画面周り
    - Main
      - CommandPalette: メッセージ検索やコマンドパレット周り
      - MainView
      - NavigationBar
      - PopupNavigator
      - StampPicker
    - Modal: モーダル周り
    - Settings: 設定画面周り
    - ShareTarget: WebShareTargetAPI から開ける画面周り
    - Toast: トースト周り
    - UI: 汎用部品
  - views: route 直下のコンポーネント一覧
  - router
  - store: ストア。詳細は`docs/store.md`を参照。
  - styles: SCSS 変数や mixin などの定義やグローバルに適用されるスタイルなど
  - sw: サービスワーカー周り
  - types: パッケージや`@types/web`に存在しない WebAPI の型定義
  - assets: 画像など
- public: 静的ファイル。基本は src を使う。URL が固定されていてほしい場合などに利用
- build: ビルド関連スクリプト
- dist: ビルド成果物
- tests: テスト
  - unit: ユニットテスト
  - e2e: E2E テスト
- coverage: テストのカバレッジ出力
- patches: dependency のパッチ。詳細は`patches/README.md`を参照

## 補足

- components/views 以下の composables はそのフォルダ以下のコンポーネントからしか利用されない composables が格納されている
