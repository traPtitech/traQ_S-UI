const appName = window.traQConfig.name || 'traQ'

const useViewTitle = () => {
  const changeViewTitle = (title: string) => {
    document.title = `${title} - ${appName}`
  }
  return { changeViewTitle }
}

export default useViewTitle
