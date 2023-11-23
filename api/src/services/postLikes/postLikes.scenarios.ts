import type { Prisma, PostLike } from '@prisma/client'
import type { ScenarioData } from '@redwoodjs/testing/api'

export const standard = defineScenario<Prisma.PostLikeCreateArgs>({
  postLike: {
    one: { data: { post: { create: { title: 'String' } } } },
    two: { data: { post: { create: { title: 'String' } } } },
  },
})

export type StandardScenario = ScenarioData<PostLike, 'postLike'>
