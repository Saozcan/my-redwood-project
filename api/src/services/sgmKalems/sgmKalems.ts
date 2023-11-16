import type { QueryResolvers, MutationResolvers } from 'types/graphql'

import { db } from 'src/lib/db'

export const sgmKalems: QueryResolvers['sgmKalems'] = () => {
  return db.sgmKalem.findMany()
}

export const sgmKalem: QueryResolvers['sgmKalem'] = ({ id }) => {
  return db.sgmKalem.findUnique({
    where: { id },
  })
}

export const createSgmKalem: MutationResolvers['createSgmKalem'] = ({
  input,
}) => {
  return db.sgmKalem.create({
    data: input,
  })
}

export const updateSgmKalem: MutationResolvers['updateSgmKalem'] = ({
  id,
  input,
}) => {
  return db.sgmKalem.update({
    data: input,
    where: { id },
  })
}

export const deleteSgmKalem: MutationResolvers['deleteSgmKalem'] = ({ id }) => {
  return db.sgmKalem.delete({
    where: { id },
  })
}
