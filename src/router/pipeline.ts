/**
 * pipelineにリダイレクトが必要な場合リダイレクトする
 * リダイレクトした場合はtrueを返す
 */
export const redirectToPipelineIfNeeded = () => {
  if (!window.traQConfig.pipelineEnabled) {
    return false
  }

  // pipeline側でリダイレクト先は制限されている
  location.href = `/pipeline${location.search}`
  return true
}
