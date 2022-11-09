# patches

ここにあるパッチは`patch-package`で生成/利用されるものである

## 各パッチの説明
### `vue-slider-component+x.x.x-x.patch`

以下の変更を行っている

- `<div>`要素などが`any`になるのを回避
  - `vue-slider-component/typings/typings/global.d.ts`で`any`に上書きされている
- `VueSlider.vue`への型の参照の削除
  - `vue-tsc`がこける
