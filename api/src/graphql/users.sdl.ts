export const schema = gql`
  type User {
    id: Int!
    name: String!
    email: String
    posts: [Post]!
  }

  type Query {
    users: [User!]! @requireAuth
    user(id: Int!): User @requireAuth
  }

  input CreateUserInput {
    name: String!
    email: String
  }

  input UpdateUserInput {
    name: String
    email: String
  }

  input CreateUserInputNested {
    name: String!
    email: String
    posts: [CreatePostInput!]
    comments: [CreateCommentInput!]
  }

  type Mutation {
    createUser(input: CreateUserInput!): User! @requireAuth
    updateUser(id: Int!, input: UpdateUserInput!): User! @requireAuth
    deleteUser(id: Int!): User! @requireAuth
    createNestedUser(input: CreateUserInputNested!): User! @requireAuth
  }
`
