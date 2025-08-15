import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  # Enums
  enum UserRole {
    NORMAL
    SPECIAL
    MODERATOR
    ADMIN
  }

  enum UserStatus {
    ONLINE
    OFFLINE
    AWAY
    DO_NOT_DISTURB
  }

  enum ChannelType {
    PUBLIC
    PRIVATE
    DIRECT
  }

  enum MessageType {
    TEXT
    QUESTION
    ANSWER
    COMMENT
    SYSTEM
  }

  enum QuestionStatus {
    OPEN
    ANSWERED
    CLOSED
    DUPLICATE
  }

  enum VoteType {
    UP
    DOWN
  }

  enum VoteTarget {
    MESSAGE
    QUESTION
    ANSWER
  }

  enum FileType {
    IMAGE
    VIDEO
    DOCUMENT
    AUDIO
  }

  enum NotificationType {
    MESSAGE
    MENTION
    VOTE
    ANSWER
    QUESTION_ANSWERED
    SYSTEM
  }

  # Types
  type User {
    id: ID!
    email: String!
    username: String!
    displayName: String!
    avatar: String
    role: UserRole!
    status: UserStatus!
    reputation: Int!
    lastSeenAt: String
    createdAt: String!
    updatedAt: String!
    
    # Relations
    messages: [Message!]!
    questions: [Question!]!
    channels: [ChannelMember!]!
    createdChannels: [Channel!]!
  }

  type Channel {
    id: ID!
    name: String!
    description: String
    type: ChannelType!
    workspaceId: String!
    isArchived: Boolean!
    createdBy: String!
    createdAt: String!
    updatedAt: String!
    
    # Relations
    creator: User!
    members: [ChannelMember!]!
    messages: [Message!]!
    questions: [Question!]!
    memberCount: Int!
  }

  type ChannelMember {
    id: ID!
    userId: String!
    channelId: String!
    joinedAt: String!
    
    # Relations
    user: User!
    channel: Channel!
  }

  type Message {
    id: ID!
    content: String!
    type: MessageType!
    isEdited: Boolean!
    isDeleted: Boolean!
    channelId: String!
    authorId: String!
    parentId: String
    questionId: String
    createdAt: String!
    updatedAt: String!
    
    # Relations
    author: User!
    channel: Channel!
    parent: Message
    replies: [Message!]!
    question: Question
    attachments: [File!]!
    votes: [Vote!]!
    voteCount: Int!
  }

  type Question {
    id: ID!
    title: String!
    content: String!
    tags: [String!]!
    status: QuestionStatus!
    viewCount: Int!
    answerCount: Int!
    voteCount: Int!
    bestAnswerId: String
    closedAt: String
    closedBy: String
    channelId: String!
    authorId: String!
    createdAt: String!
    updatedAt: String!
    
    # Relations
    author: User!
    channel: Channel!
    messages: [Message!]!
    votes: [Vote!]!
    files: [File!]!
  }

  type Vote {
    id: ID!
    userId: String!
    targetId: String!
    targetType: VoteTarget!
    type: VoteType!
    weight: Int!
    createdAt: String!
    updatedAt: String!
    
    # Relations
    user: User!
  }

  type File {
    id: ID!
    filename: String!
    originalName: String!
    mimeType: String!
    size: Int!
    type: FileType!
    url: String!
    thumbnailUrl: String
    uploadedBy: String!
    messageId: String
    questionId: String
    createdAt: String!
    updatedAt: String!
    
    # Relations
    uploader: User!
    message: Message
    question: Question
  }

  type Notification {
    id: ID!
    userId: String!
    type: NotificationType!
    title: String!
    message: String!
    data: JSON
    isRead: Boolean!
    readAt: String
    createdAt: String!
    
    # Relations
    user: User!
  }

  # Input types
  input CreateUserInput {
    email: String!
    username: String!
    displayName: String!
    password: String!
    avatar: String
  }

  input UpdateUserInput {
    displayName: String
    avatar: String
    status: UserStatus
    pushToken: String
  }

  input CreateChannelInput {
    name: String!
    description: String
    type: ChannelType!
    workspaceId: String
  }

  input UpdateChannelInput {
    name: String
    description: String
    type: ChannelType
    isArchived: Boolean
  }

  input CreateMessageInput {
    content: String!
    type: MessageType!
    channelId: String!
    parentId: String
    questionId: String
    attachments: [String!]
  }

  input UpdateMessageInput {
    content: String!
  }

  input CreateQuestionInput {
    title: String!
    content: String!
    tags: [String!]
    channelId: String!
  }

  input UpdateQuestionInput {
    title: String
    content: String
    tags: [String!]
    status: QuestionStatus
  }

  input CreateVoteInput {
    targetId: String!
    targetType: VoteTarget!
    type: VoteType!
  }

  input CreateFileInput {
    filename: String!
    originalName: String!
    mimeType: String!
    size: Int!
    type: FileType!
    url: String!
    thumbnailUrl: String
    messageId: String
    questionId: String
  }

  # Queries
  type Query {
    # User queries
    me: User
    user(id: ID!): User
    users(limit: Int, offset: Int): [User!]!
    
    # Channel queries
    channels(workspaceId: String): [Channel!]!
    channel(id: ID!): Channel
    channelMembers(channelId: ID!): [ChannelMember!]!
    
    # Message queries
    messages(channelId: ID!, limit: Int, offset: Int): [Message!]!
    message(id: ID!): Message
    messageReplies(messageId: ID!): [Message!]!
    
    # Question queries
    questions(channelId: ID, status: QuestionStatus, limit: Int, offset: Int): [Question!]!
    question(id: ID!): Question
    questionAnswers(questionId: ID!): [Message!]!
    
    # Vote queries
    votes(targetId: ID!, targetType: VoteTarget!): [Vote!]!
    
    # File queries
    files(messageId: ID, questionId: ID): [File!]!
    file(id: ID!): File
    
    # Notification queries
    notifications(limit: Int, offset: Int): [Notification!]!
    unreadNotificationsCount: Int!
  }

  # Mutations
  type Mutation {
    # Auth mutations
    register(input: CreateUserInput!): AuthResponse!
    login(email: String!, password: String!): AuthResponse!
    logout: Boolean!
    refreshToken: AuthResponse!
    
    # User mutations
    updateUser(input: UpdateUserInput!): User!
    updateUserRole(userId: ID!, role: UserRole!): User!
    deleteUser(id: ID!): Boolean!
    
    # Channel mutations
    createChannel(input: CreateChannelInput!): Channel!
    updateChannel(id: ID!, input: UpdateChannelInput!): Channel!
    deleteChannel(id: ID!): Boolean!
    joinChannel(channelId: ID!): ChannelMember!
    leaveChannel(channelId: ID!): Boolean!
    
    # Message mutations
    createMessage(input: CreateMessageInput!): Message!
    updateMessage(id: ID!, input: UpdateMessageInput!): Message!
    deleteMessage(id: ID!): Boolean!
    
    # Question mutations
    createQuestion(input: CreateQuestionInput!): Question!
    updateQuestion(id: ID!, input: UpdateQuestionInput!): Question!
    deleteQuestion(id: ID!): Boolean!
    markBestAnswer(questionId: ID!, answerId: ID!): Question!
    closeQuestion(id: ID!): Question!
    
    # Vote mutations
    createVote(input: CreateVoteInput!): Vote!
    updateVote(id: ID!, type: VoteType!): Vote!
    deleteVote(id: ID!): Boolean!
    
    # File mutations
    createFile(input: CreateFileInput!): File!
    deleteFile(id: ID!): Boolean!
    
    # Notification mutations
    markNotificationAsRead(id: ID!): Notification!
    markAllNotificationsAsRead: Boolean!
    deleteNotification(id: ID!): Boolean!
  }

  # Subscriptions
  type Subscription {
    # Real-time updates
    messageCreated(channelId: ID!): Message!
    messageUpdated(channelId: ID!): Message!
    messageDeleted(channelId: ID!): ID!
    
    questionCreated(channelId: ID!): Question!
    questionUpdated(channelId: ID!): Question!
    questionDeleted(channelId: ID!): ID!
    
    voteCreated(targetId: ID!, targetType: VoteTarget!): Vote!
    voteUpdated(targetId: ID!, targetType: VoteTarget!): Vote!
    voteDeleted(targetId: ID!, targetType: VoteTarget!): ID!
    
    userStatusChanged: User!
    notificationCreated: Notification!
  }

  # Response types
  type AuthResponse {
    user: User!
    token: String!
    refreshToken: String!
  }

  # Scalar types
  scalar JSON
`;
