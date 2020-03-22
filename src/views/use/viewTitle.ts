const useViewTitle = () => {
  const changeViewTitle = (title: string) => {
    document.title = `${title} - traQ`
  }
  return { changeViewTitle }
}

export default useViewTitle
