import { DbAuthHandler } from '@redwoodjs/auth-dbauth-api'

import { db } from 'src/lib/db'

class CustomAuthHandler<
  TUser extends Record<string | number, any>,
  TIdType = any
> extends DbAuthHandler<TUser, TIdType> {
  async _verifyUser(username, password) {
    const user = await db.user.findUnique({
      where: { email: username },
    })
  }
}

export default CustomAuthHandler
