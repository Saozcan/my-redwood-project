import type { CommentLike } from '@prisma/client'

import {
  commentLikes,
  commentLike,
  createCommentLike,
  updateCommentLike,
  deleteCommentLike,
} from './commentLikes'
import type { StandardScenario } from './commentLikes.scenarios'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('commentLikes', () => {
  scenario('returns all commentLikes', async (scenario: StandardScenario) => {
    const result = await commentLikes()

    expect(result.length).toEqual(Object.keys(scenario.commentLike).length)
  })

  scenario(
    'returns a single commentLike',
    async (scenario: StandardScenario) => {
      const result = await commentLike({ id: scenario.commentLike.one.id })

      expect(result).toEqual(scenario.commentLike.one)
    }
  )

  scenario('creates a commentLike', async (scenario: StandardScenario) => {
    const result = await createCommentLike({
      input: { commentId: scenario.commentLike.two.commentId },
    })

    expect(result.commentId).toEqual(scenario.commentLike.two.commentId)
  })

  scenario('updates a commentLike', async (scenario: StandardScenario) => {
    const original = (await commentLike({
      id: scenario.commentLike.one.id,
    })) as CommentLike
    const result = await updateCommentLike({
      id: original.id,
      input: { commentId: scenario.commentLike.two.commentId },
    })

    expect(result.commentId).toEqual(scenario.commentLike.two.commentId)
  })

  scenario('deletes a commentLike', async (scenario: StandardScenario) => {
    const original = (await deleteCommentLike({
      id: scenario.commentLike.one.id,
    })) as CommentLike
    const result = await commentLike({ id: original.id })

    expect(result).toEqual(null)
  })
})
