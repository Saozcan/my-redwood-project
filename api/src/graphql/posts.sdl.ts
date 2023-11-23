export const schema = gql`
  type Post {
    id: Int!
    title: String!
    content: String
    User: User
    userId: Int
    category: [Category]
    comment: [Comment]
    postLikes: [PostLike]
  }

  type Query {
    posts: [Post!]! @requireAuth
    post(id: Int!): Post @requireAuth
  }

  input CreatePostInput {
    title: String!
    content: String
    userId: Int
    postLikes: [CreatePostLikeInput!]
  }

  input UpdatePostInput {
    title: String
    content: String
    userId: Int
  }

  type Mutation {
    createPost(input: CreatePostInput!): Post! @requireAuth
    updatePost(id: Int!, input: UpdatePostInput!): Post! @requireAuth
    deletePost(id: Int!): Post! @requireAuth
  }
`
