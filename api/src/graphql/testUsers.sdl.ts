export const schema = gql`
  type TestUser {
    id: Int!
    name: String!
    email: String
  }

  type Query {
    testUsers: [TestUser!]! @requireAuth
    testUser(id: Int!): TestUser @requireAuth
  }

  input CreateTestUserInput {
    name: String!
    email: String
  }

  input UpdateTestUserInput {
    name: String
    email: String
  }

  type Mutation {
    createTestUser(input: CreateTestUserInput!): TestUser! @requireAuth
    updateTestUser(id: Int!, input: UpdateTestUserInput!): TestUser!
      @requireAuth
    deleteTestUser(id: Int!): TestUser! @requireAuth
  }
`
