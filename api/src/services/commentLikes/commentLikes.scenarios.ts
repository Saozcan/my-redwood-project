import type { Prisma, CommentLike } from '@prisma/client'
import type { ScenarioData } from '@redwoodjs/testing/api'

export const standard = defineScenario<Prisma.CommentLikeCreateArgs>({
  commentLike: {
    one: {
      data: {
        comment: { create: { content: 'String', post: { create: {} } } },
      },
    },
    two: {
      data: {
        comment: { create: { content: 'String', post: { create: {} } } },
      },
    },
  },
})

export type StandardScenario = ScenarioData<CommentLike, 'commentLike'>
