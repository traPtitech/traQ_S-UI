interface Tree<T> {
  children: T[]
}

/**
 * 再帰的に子孫のいずれかが条件を満たすかを判定する
 *
 * @param tree 親
 * @param f 条件を満たすかの関数
 * @param includeParent 親が条件を満たしてもよいかどうか
 */
export const deepSome = <T extends Readonly<Tree<T>>>(
  tree: T,
  f: (tree: T) => boolean,
  includeParent = false
): boolean => {
  if (includeParent && f(tree)) return true

  if (tree.children.length <= 0) return false

  const queue = [...tree.children]
  let now: T
  while (queue.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    now = queue.shift()!
    if (f(now)) return true
    queue.push(...now.children)
  }
  return false
}

/**
 * 条件を満たす節/葉に絞り込んだ木を返す
 * 条件を満たさない節の子はすべて結果に含まれない
 *
 * @param tree 元の木
 * @param f 絞り込み関数 (Array::filterのコールバック関数と同じ働き)
 */
export const filterTree = <T extends Readonly<Tree<T>>>(
  tree: T,
  f: (tree: T) => boolean
): T | null => {
  if (!f(tree)) return null

  const newChildren = filterTrees(tree.children, f)

  return {
    ...tree,
    children: newChildren
  }
}

/**
 * filterTreeの複数個版
 *
 * @see filterTree
 */
export const filterTrees = <T extends Readonly<Tree<T>>>(
  trees: readonly T[],
  f: (tree: T) => boolean
): T[] => {
  const newTrees: T[] = []
  for (const tree of trees) {
    const newTree = filterTree(tree, f)
    if (newTree) {
      newTrees.push(newTree)
    }
  }

  return newTrees
}
