import type {
  QueryResolvers,
  MutationResolvers,
  CommentLikeRelationResolvers,
} from 'types/graphql'

import { db } from 'src/lib/db'

export const commentLikes: QueryResolvers['commentLikes'] = () => {
  return db.commentLike.findMany()
}

export const commentLike: QueryResolvers['commentLike'] = ({ id }) => {
  return db.commentLike.findUnique({
    where: { id },
  })
}

export const createCommentLike: MutationResolvers['createCommentLike'] = ({
  input,
}) => {
  return db.commentLike.create({
    data: input,
  })
}

export const updateCommentLike: MutationResolvers['updateCommentLike'] = ({
  id,
  input,
}) => {
  return db.commentLike.update({
    data: input,
    where: { id },
  })
}

export const deleteCommentLike: MutationResolvers['deleteCommentLike'] = ({
  id,
}) => {
  return db.commentLike.delete({
    where: { id },
  })
}

export const CommentLike: CommentLikeRelationResolvers = {
  comment: (_obj, { root }) => {
    return db.commentLike.findUnique({ where: { id: root?.id } }).comment()
  },
}
