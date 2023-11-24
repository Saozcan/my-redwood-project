import { create, get, update } from 'lodash'
import type {
  QueryResolvers,
  MutationResolvers,
  UserRelationResolvers,
} from 'types/graphql'

import { db } from 'src/lib/db'
import { updateNestedData } from 'src/lib/prismaUpdateStruct/getNestedStruct'

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

export const updateUser: MutationResolvers['updateUser'] = async ({
  id,
  input,
}) => {
  const current = await db.user.findUnique({
    where: { id },
    include: { posts: { include: { postLikes: true, comment: true } } },
  })
  const generatePrisma = updateNestedData({
    incomingData: { ...input, id },
    currentData: { ...current, id },
  })
  console.dir(generatePrisma, { depth: 15 })

  return db.user.update(generatePrisma)
  // return db.user.update({
  //   data: {
  //     posts: {
  //       upsert: [
  //         {
  //           update: {
  //             id: 4,
  //             title: '10',
  //             comment: {
  //               upsert: [
  //                 {
  //                   update: {
  //                     id: 14,
  //                     content: 'another update test',
  //                   },
  //                   create: {
  //                     id: 14,
  //                     content: 'another update test',
  //                   },
  //                   where: {
  //                     id: 14,
  //                   },
  //                 },
  //                 {
  //                   update: {
  //                     id: 15,
  //                     content: 'updateTest',
  //                   },
  //                   create: {
  //                     id: 15,
  //                     content: 'updateTest',
  //                   },
  //                   where: {
  //                     id: 15,
  //                   },
  //                 },
  //                 {
  //                   update: {
  //                     id: 11,
  //                     content: '123123123',
  //                     commentLike: {
  //                       upsert: [
  //                         {
  //                           update: {
  //                             id: 1,
  //                             likeCount: 123,
  //                           },
  //                           create: {
  //                             id: 1,
  //                             likeCount: 123,
  //                           },
  //                           where: {
  //                             id: 1,
  //                           },
  //                         },
  //                       ],
  //                     },
  //                   },
  //                   create: {
  //                     id: 11,
  //                     content: '123123123',
  //                     commentLike: {
  //                       create: [
  //                         {
  //                           id: 1,
  //                           likeCount: 123,
  //                         },
  //                       ],
  //                     },
  //                   },
  //                   where: {
  //                     id: 11,
  //                   },
  //                 },
  //               ],
  //             },
  //           },
  //           create: {
  //             id: 4,
  //             title: '10',
  //             comment: {
  //               create: [
  //                 {
  //                   id: 14,
  //                   content: 'another update test',
  //                 },
  //                 {
  //                   id: 15,
  //                   content: 'updateTest',
  //                 },
  //                 {
  //                   id: 11,
  //                   content: '123123123',
  //                   commentLike: {
  //                     create: [
  //                       {
  //                         id: 1,
  //                         likeCount: 123,
  //                       },
  //                     ],
  //                   },
  //                 },
  //               ],
  //             },
  //           },
  //           where: {
  //             id: 4,
  //           },
  //         },
  //       ],
  //     },
  //     id: 4,
  //   },
  //   where: {
  //     id: 4,
  //   },
  // })
}

export const createNestedUser: MutationResolvers['createNestedUser'] = ({
  input,
}) => {
  return db.user.create({
    data: {
      name: 'ahmet',
      email: 'mehmet',
      posts: [
        {
          context: 'context',
          title: 'title',
          comment: [
            {
              id: 123,
              content: 'test',
            },
          ],
        },
      ],
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
