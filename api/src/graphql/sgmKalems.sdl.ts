export const schema = gql`
  type SgmKalem {
    id: Int!
    kalem_kodu: String!
    kalem_adi: String
  }

  type Query {
    sgmKalems: [SgmKalem!]! @requireAuth
    sgmKalem(id: Int!): SgmKalem @requireAuth
  }

  input CreateSgmKalemInput {
    kalem_kodu: String!
    kalem_adi: String
  }

  input UpdateSgmKalemInput {
    kalem_kodu: String
    kalem_adi: String
  }

  type Mutation {
    createSgmKalem(input: CreateSgmKalemInput!): SgmKalem! @requireAuth
    updateSgmKalem(id: Int!, input: UpdateSgmKalemInput!): SgmKalem!
      @requireAuth
    deleteSgmKalem(id: Int!): SgmKalem! @requireAuth
  }
`
