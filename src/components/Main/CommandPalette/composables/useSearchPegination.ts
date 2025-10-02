import apis from '/@/lib/apis'
import {
  toSearchMessageParam,
  type SearchMessageQueryObject
} from '/@/lib/searchMessage/queryParser'

// type Options = {
//   queryObject: SearchMessageQueryObject
//   options: SearchMessageOptions
// }

const useSearchPagination = (queryObject: SearchMessageQueryObject) => {
  const computeTotalHits = async () => {
    let after = new Date(0)
    let totalHitsSum = 0

    while (true) {
      const {
        data: { hits, totalHits }
      } = await apis.searchMessages(
        ...toSearchMessageParam(
          { ...queryObject, after: after.toISOString() },
          {
            limit: 100,
            offset: 9900,
            sort: '-createdAt'
          }
        )
      )
      const lastMessage = hits.at(-1)
      totalHitsSum += totalHits
      if (!lastMessage || totalHits < 10000) {
        return totalHitsSum
      }

      after = new Date(lastMessage.createdAt)
    }
  }

  return { computeTotalHits }
}

export default useSearchPagination
