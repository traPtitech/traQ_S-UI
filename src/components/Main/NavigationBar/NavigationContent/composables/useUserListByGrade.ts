import { computed } from 'vue'
import { compareStringInsensitive } from '/@/lib/basic/string'
import { isDefined } from '/@/lib/basic/array'
import { useGroupsStore } from '/@/store/entities/groups'
import { useUsersStore } from '/@/store/entities/users'
import { User } from '@traptitech/traq'
import useUserList from '/@/composables/users/useUserList'

interface UsersGradeList {
  gradeName: string
  users: User[]
}

const useUserListByGrade = () => {
  const { gradeGroups } = useGroupsStore()
  const { activeUsersMap } = useUsersStore()
  const userList = useUserList()

  const listByGradeName = computed((): UsersGradeList[] => {
    if (userList.value.length === 0) {
      return []
    }
    if (gradeGroups.value.length === 0) {
      return [
        {
          gradeName: 'Others',
          users: userList.value
        }
      ]
    }

    const userGrades: UsersGradeList[] = []
    const categorized = new Set<string>()

    // 学年グループ
    for (const group of gradeGroups.value) {
      const member = group.members
        .map(member => activeUsersMap.value.get(member.id))
        .filter(isDefined)
        .sort((u1, u2) => compareStringInsensitive(u1.name, u2.name))
      if (member.length === 0) continue // グループ内にメンバーが居ない場合は非表示

      userGrades.push({ gradeName: group.name, users: member })

      member.map(user => user.id).forEach(id => categorized.add(id))
    }

    // BOTグループ
    const bots = userList.value.filter(user => user.bot)
    bots.map(user => user.id).forEach(id => categorized.add(id))

    // その他グループ
    const others = userList.value.filter(user => !categorized.has(user.id))

    const result = [
      ...userGrades.sort(
        (e1, e2) => compareStringInsensitive(e1.gradeName, e2.gradeName, true) // 学年なので逆順
      )
    ]
    if (others.length > 0) result.push({ gradeName: 'Others', users: others })
    if (bots.length > 0) result.push({ gradeName: 'BOT', users: bots })

    return result
  })
  return listByGradeName
}

export default useUserListByGrade
