export const schema = gql`
  type Comment {
    id: Int!
    content: String!
    post: Post!
    postId: Int!
  }

  type Query {
    comments: [Comment!]! @requireAuth
    comment(id: Int!): Comment @requireAuth
  }

  input CreateCommentInput {
    content: String!
    postId: Int!
  }

  input UpdateCommentInput {
    id: Int
    content: String
    postLikes: [UpdatePostLikeInput]
    
  }

  type Mutation {
    createComment(input: CreateCommentInput!): Comment! @requireAuth
    updateComment(id: Int!, input: UpdateCommentInput!): Comment! @requireAuth
    deleteComment(id: Int!): Comment! @requireAuth
  }
`
