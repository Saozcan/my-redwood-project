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
    include: {
      posts: { include: { comment: { include: { commentLike: true } } } },
    },
  })
  const generatePrisma = updateNestedData({
    incomingData: { ...input, id },
    currentData: { ...current, id },
  })
  console.dir(generatePrisma, { depth: 15 })

  if (!generatePrisma) {
    return { ...input, id } as any
  }
  return db.user.update(generatePrisma)
  // return db.user.update({
  //   data: {
  //     posts: {
  //       update: [
  //         {
  //           data: {
  //             id: 8,
  //             comment: {
  //               update: [
  //                 {
  //                   data: {
  //                     id: 5558,
  //                     commentLike: {
  //                       update: [
  //                         {
  //                           data: {
  //                             id: 5558,
  //                           },
  //                           where: {
  //                             id: 5558,
  //                           },
  //                         },
  //                       ],
  //                       delete: [
  //                         {
  //                           id: 5558,
  //                         },
  //                       ],
  //                     },
  //                   },
  //                   where: {
  //                     id: 5558,
  //                   },
  //                 },
  //               ],
  //               delete: [
  //                 {
  //                   id: 5558,
  //                 },
  //               ],
  //             },
  //           },
  //           where: {
  //             id: 8,
  //           },
  //         },
  //       ],
  //       delete: [
  //         {
  //           id: 8,
  //         },
  //       ],
  //     },
  //   },
  //   where: {
  //     id: 3,
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
