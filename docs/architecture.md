# アーキテクチャ

## コーディング

- 基本は`ref`を利用する。
- ロジックは`useなんとか`という形で composables として抽出する。
- ほかのコンポーネントでも利用する composables は別ファイルに切り出す。
- `computed`が複雑になるときは中の関数を純粋関数にして`lib`におく。純粋関数にすることでテストがしやすくなるため。

### コードの依存関係

1. lib
1. composables
1. components
1. views

の依存関係になるようにする。

## スタイル

- テーマで利用するものは CSS 変数を利用する。`<body>`に CSS 変数が注入される。
- SCSS からは`$theme-ui-primary`などのように利用可能である。頻出のものは mixin があるので、`@include color-ui-primary`のように使う。
- ロジックによる出し分けが必要な場合は、WAI-ARIA の属性または`data-`属性を利用する。
- 直接 style を設定するのは、複雑な処理を行う場合以外は避ける。

例:

```vue
<template>
  <div :class="$style.po" :disabled="bar">foo</div>
</template>

<script lang="ts" setup>
const bar = ref(false)
</script>

<style lang="scss" module>
.po {
  opacity: 1;
  &[disabled] {
    opacity: 0.5;
  }
}
</style>
```

### `font-size`に関して

一貫性を保つため、特殊な事例を除いて mixin の`size-*`を利用すること。

### `font-weight`に関して

`normal`と`bold`を利用すること。
一貫性を保つため、またフォントがそれらしかロードされないため。

## MainPage のコンポーネントの構造

MainPage はチャンネル表示やクリップフォルダの表示があるページのこと。

- NavigationBar
- MainView
  - MainViewHeader (!1)
  - PrimaryView
    - PrimaryViewHeader: !1 へ teleport
    - PrimaryViewContent
    - PrimaryViewSidebar: モバイル時は!3 へ teleport
      - PrimaryViewSiderbarContent
      - PrimaryViewSidebarOpener: !2 へ teleport
  - PrimaryViewSidebarHidden (!2): 現在は未使用
  - SecondaryView
- SidebarMobile (!3)

![image](https://user-images.githubusercontent.com/49056869/170906493-d200b0e5-baf3-4be5-aa89-be4db5ea2f2e.png)
![image](https://user-images.githubusercontent.com/49056869/170906508-00734867-b3d2-4fcd-b53a-0a142ece1452.png)
![image](https://user-images.githubusercontent.com/49056869/170906523-5c253f28-40ed-4d43-8212-e97de7111c0f.png) ![image](https://user-images.githubusercontent.com/49056869/170906535-2615d42c-86f8-4198-8353-3831b215b08c.png)

参考: [#3172](https://github.com/traPtitech/traQ_S-UI/pull/3172)

# ユーザーから見たデータの流れ

1. NavigationSelector: 「ホーム」「アクティビティ」
1. NavigationContent: 「チャンネル」「クリップフォルダ」
1. MainView: 「メッセージ一覧」
