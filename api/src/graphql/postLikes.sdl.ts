export const schema = gql`
  type PostLike {
    id: Int!
    postId: Int
    likeCount: Int!
    post: Post!
  }

  type Query {
    postLikes: [PostLike!]! @requireAuth
    postLike(id: Int!): PostLike @requireAuth
  }

  input CreatePostLikeInput {
    postId: Int!
    likeCount: Int!
  }

  input UpdatePostLikeInput {
    id: Int
    likeCount: Int
  }

  type Mutation {
    createPostLike(input: CreatePostLikeInput!): PostLike! @requireAuth
    updatePostLike(id: Int!, input: UpdatePostLikeInput!): PostLike!
      @requireAuth
    deletePostLike(id: Int!): PostLike! @requireAuth
  }
`
