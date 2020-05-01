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
export const deepSome = <T extends Tree<T>>(
  tree: T,
  f: (tree: T) => boolean,
  includeParent = false
): boolean => {
  if (includeParent && f(tree)) return true

  return tree.children.some(t => deepSome(t, f, true))
}
