export const schema = gql`
  input Login {
    username: String!
    password: String!
  }

  input RefreshToken {
    username: String!
    refreshToken: String!
  }

  input Logout {
    username: String!
    refreshToken: String!
  }

  type Token {
    accessToken: String!
    refreshToken: String!
  }

  type Mutation {
    login(input: Login!): Token! @skipAuth
    refreshToken(input: RefreshToken!): Token! @skipAuth
    logout(input: Logout!): Boolean @requireAuth
  }
`
