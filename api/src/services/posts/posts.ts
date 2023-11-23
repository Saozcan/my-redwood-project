import type {
  QueryResolvers,
  MutationResolvers,
  PostRelationResolvers,
} from 'types/graphql'

import { db } from 'src/lib/db'

export const posts: QueryResolvers['posts'] = () => {
  return db.post.findMany()
}

export const post: QueryResolvers['post'] = ({ id }) => {
  return db.post.findUnique({
    where: { id },
  })
}

export const createPost: MutationResolvers['createPost'] = ({ input }) => {
  return db.post.create({
    data: {
      ...input,
      postLikes: {
        create: {
          likeCount: 10,
        },
      },
    },
  })
}

export const updatePost: MutationResolvers['updatePost'] = ({ id, input }) => {
  return db.post.update({
    data: input,
    where: { id },
  })
}

export const deletePost: MutationResolvers['deletePost'] = ({ id }) => {
  return db.post.delete({
    where: { id },
  })
}

export const Post: PostRelationResolvers = {
  User: (_obj, { root }) => {
    return db.post.findUnique({ where: { id: root?.id } }).User()
  },
  category: (_obj, { root }) => {
    return db.post.findUnique({ where: { id: root?.id } }).category()
  },
  comment: (_obj, { root }) => {
    return db.post.findUnique({ where: { id: root?.id } }).comment()
  },
  postLikes: (_obj, { root }) => {
    return db.post.findUnique({ where: { id: root?.id } }).postLikes()
  },
}
