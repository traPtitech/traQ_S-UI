# patches

ここにあるパッチは`patch-package`で生成/利用されるものである

## 各パッチの説明
### `fonteditor-core+x.x.x.patch`

`build/gen-mplus.mjs`で利用している`fonteditor-core`におけるバグを修正している
https://github.com/kekee000/fonteditor-core/pull/47 がマージされリリースされれば、
アップデートを行うことで取り除ける

### `vue-slider-component+x.x.x-x.patch`

以下の二つの変更を行っている

- 非推奨になった`/`の`*`への置き換え
  - https://sass-lang.com/documentation/breaking-changes/slash-div
- `<div>`要素などが`any`になるのを回避
  - `vue-slider-component/typings/typings/global.d.ts`で`any`に上書きされている
