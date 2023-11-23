import { create, get } from 'lodash'
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
    include: { posts: { include: { postLikes: true } } },
  })
  const generatePrisma = updateNestedData({
    incomingData: { ...input, id },
    currentData: { ...current, id },
  })

  return db.user.update(generatePrisma)
}

export const createNestedUser: MutationResolvers['createNestedUser'] = ({
  input,
}) => {
  return db.user.create(input)
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
