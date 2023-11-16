import type { QueryResolvers, MutationResolvers } from 'types/graphql'

import { db } from 'src/lib/db'

export const testUsers: QueryResolvers['testUsers'] = () => {
  return db.testUser.findMany()
}

export const testUser: QueryResolvers['testUser'] = ({ id }) => {
  return db.testUser.findUnique({
    where: { id },
  })
}

export const createTestUser: MutationResolvers['createTestUser'] = ({
  input,
}) => {
  return db.testUser.create({
    data: input,
  })
}

export const updateTestUser: MutationResolvers['updateTestUser'] = ({
  id,
  input,
}) => {
  return db.testUser.update({
    data: input,
    where: { id },
  })
}

export const deleteTestUser: MutationResolvers['deleteTestUser'] = ({ id }) => {
  return db.testUser.delete({
    where: { id },
  })
}
