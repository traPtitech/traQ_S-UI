# patches

ここにあるパッチは`patch-package`で生成/利用されるものである

## 各パッチの説明
### `fonteditor-core+x.x.x.patch`

`build/gen-mplus.mjs`で利用している`fonteditor-core`におけるバグを修正している
https://github.com/kekee000/fonteditor-core/pull/47 がマージされリリースされれば、
アップデートを行うことで取り除ける

### `vue-slider-component+x.x.x-x.patch`

以下の変更を行っている

- `<div>`要素などが`any`になるのを回避
  - `vue-slider-component/typings/typings/global.d.ts`で`any`に上書きされている
