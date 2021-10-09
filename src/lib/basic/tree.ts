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
