import type {
  QueryResolvers,
  MutationResolvers,
  UserRelationResolvers,
} from 'types/graphql'

import { db } from 'src/lib/db'

export const users: QueryResolvers['users'] = () => {
  return db.user.findMany()
}

export const user: QueryResolvers['user'] = ({ id }) => {
  return db.user.findUnique({
    where: { id },
  })
}

export const createUser: MutationResolvers['createUser'] = ({ input }) => {
  return db.user.create({
    data: input,
  })
}

export const updateUser: MutationResolvers['updateUser'] = ({ id, input }) => {
  return db.user.update({
    data: {
      ...input,
      posts: {
        update: {
          where: { id: 11 },
          data: {
            title: 'Updated Post 1',
            content: 'Updated Post 1',
            postLikes: {
              update: {
                where: { id: 2 },
                data: { likeCount: 55 },
              },
            },
          },
        },
      },
    },
    where: { id },
  })
}

export const createNestedUser: MutationResolvers['createNestedUser'] = ({
  input,
}) => {
  return db.user.create({
    data: {
      ...input,
      name: 'Ahmet',
      posts: {
        create: [
          {
            title: 'Post 1',
            content: 'This is post 1',
            comment: {
              connectOrCreate: {
                create: {
                  content: 'This is comment 1',
                },
                where: {
                  id: 1,
                },
              },
            },
          },
        ],
      },
    },
  })
}

export const deleteUser: MutationResolvers['deleteUser'] = ({ id }) => {
  return db.user.delete({
    where: { id },
  })
}

export const User: UserRelationResolvers = {
  posts: (_obj, { root }) => {
    return db.user.findUnique({ where: { id: root?.id } }).posts()
  },
}
