import { isActive } from '/@/lib/user'
import { UserAccountState, User } from '@traptitech/traq'

const baseUser: Omit<User, 'state'> = {
  id: '',
  name: '',
  displayName: '',
  bot: false,
  iconFileId: '',
  updatedAt: ''
}

describe('isActive', () => {
  it('can detect active state', () => {
    expect(isActive({ ...baseUser, state: UserAccountState.active })).toEqual(
      true
    )
  })
  it('can detect deactivated state', () => {
    expect(
      isActive({ ...baseUser, state: UserAccountState.deactivated })
    ).toEqual(false)
  })
  it('can detect suspended state', () => {
    expect(
      isActive({ ...baseUser, state: UserAccountState.suspended })
    ).toEqual(false)
  })
})
