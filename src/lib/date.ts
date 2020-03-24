export const getDisplayDate = (createdAt: string, updatedAt: string) => {
  const createdDate = new Date(createdAt)
  if (createdAt === updatedAt) {
    return (
      createdDate.getHours().toString().padStart(2, '0') +
      ':' +
      createdDate.getMinutes().toString().padStart(2, '0')
    )
  } else {
    const updatedDate = new Date(updatedAt)
    let result =
      updatedDate.getHours().toString().padStart(2, '0') +
      ':' +
      updatedDate.getMinutes().toString().padStart(2, '0')
    if (
      createdDate.getDate() !== updatedDate.getDate() ||
      createdDate.getMonth() !== updatedDate.getMonth()
    ) {
      result =
        (updatedDate.getMonth() + 1).toString().padStart(2, '0') +
        '/' +
        updatedDate.getDate().toString().padStart(2, '0') +
        ' ' +
        result
    }
    if (createdDate.getFullYear() !== updatedDate.getFullYear()) {
      result = updatedDate.getFullYear().toString() + '/' + result
    }
    return result
  }
}
