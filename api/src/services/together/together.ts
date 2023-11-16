import type { QueryResolvers, Together } from 'types/graphql'

import { db } from 'src/lib/db'

export const Together = {
  user: async ({ id }) => {
    return db.user.findUnique({
      where: { id },
    })
  },
  post: async ({ id }) => {
    return db.post.findUnique({
      where: { id },
    })
  },
  id: ({ id }) => id,
}
