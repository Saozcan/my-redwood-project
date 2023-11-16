export const schema = gql`
  type Together {
    id: Int!
    user: User!
    post: Post!
  }

  type Query {
    together(id: Int!): Together @requireAuth
  }
`
