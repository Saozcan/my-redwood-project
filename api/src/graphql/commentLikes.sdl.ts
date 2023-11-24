export const schema = gql`
  type CommentLike {
    id: Int!
    commentId: Int!
    likeCount: Int!
    comment: Comment!
  }

  type Query {
    commentLikes: [CommentLike!]! @requireAuth
    commentLike(id: Int!): CommentLike @requireAuth
  }

  input CreateCommentLikeInput {
    commentId: Int!
    likeCount: Int!
  }

  input UpdateCommentLikeInput {
    id: Int
    commentId: Int
    likeCount: Int
  }

  type Mutation {
    createCommentLike(input: CreateCommentLikeInput!): CommentLike! @requireAuth
    updateCommentLike(id: Int!, input: UpdateCommentLikeInput!): CommentLike!
      @requireAuth
    deleteCommentLike(id: Int!): CommentLike! @requireAuth
  }
`
