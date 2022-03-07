# ストアについて

## モジュールの種類分けについて
### `ui`
通信することもIndexedDBを利用することもないストア
特定のコンポーネントのみが利用することが多い
ここが他のストアを変更することはあっても、ここをほかのストアが変更することはない

## 各モジュールについて
- IDは衝突を避けるため、ディレクトリと同じ名称にする
  - 例: `/@/store/ui/modal`にあるならば、`ui/modal`にする
- ストアはstoreSetupを利用した形式(関数で定義する形式)で定義する
- `export`するものは`/@/store/utils/convertToRefsStore`を利用したものにする
  - これは分割代入を行っても壊れないようにするため
  - また、コードベースで全体的にReactiveよりもRefを多用する書き方を採用しているため
- HMR対応用のコードを書く
  - [piniaのドキュメント](https://pinia.vuejs.org/cookbook/hot-module-replacement.html)を参照
  - `acceptHMRUpdate`には`convertToRefsStore`を行う前のものを渡すこと

## テンプレート
```ts
import { defineStore, acceptHMRUpdate } from 'pinia'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'

const useModalStorePinia = defineStore('ui/modal', () => {
  // TODO
  return {}
})

export const useModalStore = convertToRefsStore(useModalStorePinia)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useModalStorePinia, import.meta.hot))
}
```
