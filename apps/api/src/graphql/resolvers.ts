import { PrismaClient } from '@prisma/client';
import { GraphQLError } from 'graphql';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole, UserStatus, ChannelType, MessageType, QuestionStatus, VoteType, VoteTarget, FileType, NotificationType } from '@qup/shared';

const prisma = new PrismaClient();

// Context type for authentication
interface Context {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

// Helper function to check if user is authenticated
const requireAuth = (context: Context) => {
  if (!context.user) {
    throw new GraphQLError('Authentication required', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  return context.user;
};

// Helper function to check if user has required role
const requireRole = (context: Context, requiredRole: UserRole) => {
  const user = requireAuth(context);
  if (user.role !== requiredRole && user.role !== UserRole.ADMIN) {
    throw new GraphQLError('Insufficient permissions', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
  return user;
};

export const resolvers = {
  Query: {
    // User queries
    me: async (_: any, __: any, context: Context) => {
      const user = requireAuth(context);
      return await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          channels: {
            include: { channel: true }
          }
        }
      });
    },

    user: async (_: any, { id }: { id: string }, context: Context) => {
      requireAuth(context);
      return await prisma.user.findUnique({
        where: { id },
        include: {
          channels: {
            include: { channel: true }
          }
        }
      });
    },

    users: async (_: any, { limit = 50, offset = 0 }: { limit?: number; offset?: number }, context: Context) => {
      requireAuth(context);
      return await prisma.user.findMany({
        take: limit,
        skip: offset,
        include: {
          channels: {
            include: { channel: true }
          }
        }
      });
    },

    // Channel queries
    channels: async (_: any, { limit = 50, offset = 0 }: { limit?: number; offset?: number }, context: Context) => {
      const user = requireAuth(context);
      return await prisma.channel.findMany({
        take: limit,
        skip: offset,
        where: {
          OR: [
            { type: ChannelType.PUBLIC },
            {
              members: {
                some: { userId: user.id }
              }
            }
          ]
        },
        include: {
          creator: true,
          members: {
            include: { user: true }
          },
          _count: {
            select: {
              messages: true,
              questions: true
            }
          }
        }
      });
    },

    channel: async (_: any, { id }: { id: string }, context: Context) => {
      const user = requireAuth(context);
      const channel = await prisma.channel.findUnique({
        where: { id },
        include: {
          creator: true,
          members: {
            include: { user: true }
          },
          messages: {
            include: {
              author: true,
              attachments: true,
              votes: true
            },
            orderBy: { createdAt: 'desc' },
            take: 50
          },
          questions: {
            include: {
              author: true,
              votes: true,
              files: true
            },
            orderBy: { createdAt: 'desc' },
            take: 20
          }
        }
      });

      if (!channel) {
        throw new GraphQLError('Channel not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Check if user has access to private channel
      if (channel.type === ChannelType.PRIVATE) {
        const isMember = channel.members.some(member => member.userId === user.id);
        if (!isMember && channel.createdBy !== user.id) {
          throw new GraphQLError('Access denied', {
            extensions: { code: 'FORBIDDEN' },
          });
        }
      }

      return channel;
    },

    // Message queries
    messages: async (_: any, { channelId, limit = 50, offset = 0 }: { channelId: string; limit?: number; offset?: number }, context: Context) => {
      const user = requireAuth(context);
      
      // Check if user has access to channel
      const channel = await prisma.channel.findUnique({
        where: { id: channelId },
        include: { members: true }
      });

      if (!channel) {
        throw new GraphQLError('Channel not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (channel.type === ChannelType.PRIVATE) {
        const isMember = channel.members.some(member => member.userId === user.id);
        if (!isMember && channel.createdBy !== user.id) {
          throw new GraphQLError('Access denied', {
            extensions: { code: 'FORBIDDEN' },
          });
        }
      }

      return await prisma.message.findMany({
        where: { channelId },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          author: true,
          attachments: true,
          votes: true,
          replies: {
            include: {
              author: true,
              votes: true
            }
          }
        }
      });
    },

    // Question queries
    questions: async (_: any, { channelId, status, limit = 20, offset = 0 }: { channelId?: string; status?: QuestionStatus; limit?: number; offset?: number }, context: Context) => {
      const user = requireAuth(context);
      
      const where: any = {};
      if (channelId) where.channelId = channelId;
      if (status) where.status = status;

      return await prisma.question.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          author: true,
          channel: true,
          votes: true,
          files: true,
          messages: {
            include: {
              author: true,
              votes: true
            }
          }
        }
      });
    },

    question: async (_: any, { id }: { id: string }, context: Context) => {
      requireAuth(context);
      return await prisma.question.findUnique({
        where: { id },
        include: {
          author: true,
          channel: true,
          votes: true,
          files: true,
          messages: {
            include: {
              author: true,
              votes: true
            },
            orderBy: { createdAt: 'asc' }
          }
        }
      });
    },

    // Search queries
    search: async (_: any, { query, type, limit = 20 }: { query: string; type?: string; limit?: number }, context: Context) => {
      requireAuth(context);
      
      const results: any = {};
      
      if (!type || type === 'messages') {
        results.messages = await prisma.message.findMany({
          where: {
            content: { contains: query, mode: 'insensitive' }
          },
          take: limit,
          include: {
            author: true,
            channel: true
          }
        });
      }
      
      if (!type || type === 'questions') {
        results.questions = await prisma.question.findMany({
          where: {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { content: { contains: query, mode: 'insensitive' } }
            ]
          },
          take: limit,
          include: {
            author: true,
            channel: true
          }
        });
      }
      
      if (!type || type === 'users') {
        results.users = await prisma.user.findMany({
          where: {
            OR: [
              { username: { contains: query, mode: 'insensitive' } },
              { displayName: { contains: query, mode: 'insensitive' } }
            ]
          },
          take: limit
        });
      }
      
      return results;
    }
  },

  Mutation: {
    // Authentication mutations
    register: async (_: any, { input }: { input: any }) => {
      const { email, username, displayName, password } = input;
      
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { username }]
        }
      });
      
      if (existingUser) {
        throw new GraphQLError('User already exists', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          username,
          displayName,
          password: hashedPassword,
          role: UserRole.NORMAL
        }
      });
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );
      
      return { user, token };
    },

    login: async (_: any, { input }: { input: any }) => {
      const { email, password } = input;
      
      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      });
      
      if (!user) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      
      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      
      // Update last seen
      await prisma.user.update({
        where: { id: user.id },
        data: { lastSeenAt: new Date() }
      });
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );
      
      return { user, token };
    },

    // Channel mutations
    createChannel: async (_: any, { input }: { input: any }, context: Context) => {
      const user = requireAuth(context);
      const { name, description, type = ChannelType.PUBLIC } = input;
      
      const channel = await prisma.channel.create({
        data: {
          name,
          description,
          type,
          createdBy: user.id,
          members: {
            create: {
              userId: user.id
            }
          }
        },
        include: {
          creator: true,
          members: {
            include: { user: true }
          }
        }
      });
      
      return channel;
    },

    joinChannel: async (_: any, { channelId }: { channelId: string }, context: Context) => {
      const user = requireAuth(context);
      
      const channel = await prisma.channel.findUnique({
        where: { id: channelId },
        include: { members: true }
      });
      
      if (!channel) {
        throw new GraphQLError('Channel not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      
      if (channel.type === ChannelType.PRIVATE) {
        throw new GraphQLError('Cannot join private channel', {
          extensions: { code: 'FORBIDDEN' },
        });
      }
      
      const existingMember = channel.members.find(member => member.userId === user.id);
      if (existingMember) {
        throw new GraphQLError('Already a member of this channel', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
      
      await prisma.channelMember.create({
        data: {
          userId: user.id,
          channelId
        }
      });
      
      return { success: true };
    },

    leaveChannel: async (_: any, { channelId }: { channelId: string }, context: Context) => {
      const user = requireAuth(context);
      
      await prisma.channelMember.deleteMany({
        where: {
          userId: user.id,
          channelId
        }
      });
      
      return { success: true };
    },

    // Message mutations
    createMessage: async (_: any, { input }: { input: any }, context: Context) => {
      const user = requireAuth(context);
      const { content, channelId, parentId, questionId, type = MessageType.TEXT } = input;
      
      // Check if user has access to channel
      const channel = await prisma.channel.findUnique({
        where: { id: channelId },
        include: { members: true }
      });
      
      if (!channel) {
        throw new GraphQLError('Channel not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      
      if (channel.type === ChannelType.PRIVATE) {
        const isMember = channel.members.some(member => member.userId === user.id);
        if (!isMember && channel.createdBy !== user.id) {
          throw new GraphQLError('Access denied', {
            extensions: { code: 'FORBIDDEN' },
          });
        }
      }
      
      const message = await prisma.message.create({
        data: {
          content,
          type,
          channelId,
          authorId: user.id,
          parentId,
          questionId
        },
        include: {
          author: true,
          attachments: true,
          votes: true
        }
      });
      
      return message;
    },

    updateMessage: async (_: any, { id, input }: { id: string; input: any }, context: Context) => {
      const user = requireAuth(context);
      const { content } = input;
      
      const message = await prisma.message.findUnique({
        where: { id }
      });
      
      if (!message) {
        throw new GraphQLError('Message not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      
      if (message.authorId !== user.id && user.role !== UserRole.ADMIN && user.role !== UserRole.MODERATOR) {
        throw new GraphQLError('Cannot edit this message', {
          extensions: { code: 'FORBIDDEN' },
        });
      }
      
      return await prisma.message.update({
        where: { id },
        data: {
          content,
          isEdited: true
        },
        include: {
          author: true,
          attachments: true,
          votes: true
        }
      });
    },

    deleteMessage: async (_: any, { id }: { id: string }, context: Context) => {
      const user = requireAuth(context);
      
      const message = await prisma.message.findUnique({
        where: { id }
      });
      
      if (!message) {
        throw new GraphQLError('Message not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      
      if (message.authorId !== user.id && user.role !== UserRole.ADMIN && user.role !== UserRole.MODERATOR) {
        throw new GraphQLError('Cannot delete this message', {
          extensions: { code: 'FORBIDDEN' },
        });
      }
      
      await prisma.message.update({
        where: { id },
        data: { isDeleted: true }
      });
      
      return { success: true };
    },

    // Question mutations
    createQuestion: async (_: any, { input }: { input: any }, context: Context) => {
      const user = requireAuth(context);
      const { title, content, channelId, tags = [] } = input;
      
      // Check if user has access to channel
      const channel = await prisma.channel.findUnique({
        where: { id: channelId },
        include: { members: true }
      });
      
      if (!channel) {
        throw new GraphQLError('Channel not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      
      if (channel.type === ChannelType.PRIVATE) {
        const isMember = channel.members.some(member => member.userId === user.id);
        if (!isMember && channel.createdBy !== user.id) {
          throw new GraphQLError('Access denied', {
            extensions: { code: 'FORBIDDEN' },
          });
        }
      }
      
      const question = await prisma.question.create({
        data: {
          title,
          content,
          tags,
          channelId,
          authorId: user.id
        },
        include: {
          author: true,
          channel: true,
          votes: true,
          files: true
        }
      });
      
      return question;
    },

    updateQuestion: async (_: any, { id, input }: { id: string; input: any }, context: Context) => {
      const user = requireAuth(context);
      const { title, content, tags } = input;
      
      const question = await prisma.question.findUnique({
        where: { id }
      });
      
      if (!question) {
        throw new GraphQLError('Question not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      
      if (question.authorId !== user.id && user.role !== UserRole.ADMIN && user.role !== UserRole.MODERATOR) {
        throw new GraphQLError('Cannot edit this question', {
          extensions: { code: 'FORBIDDEN' },
        });
      }
      
      return await prisma.question.update({
        where: { id },
        data: {
          title,
          content,
          tags
        },
        include: {
          author: true,
          channel: true,
          votes: true,
          files: true
        }
      });
    },

    closeQuestion: async (_: any, { id }: { id: string }, context: Context) => {
      const user = requireAuth(context);
      
      const question = await prisma.question.findUnique({
        where: { id }
      });
      
      if (!question) {
        throw new GraphQLError('Question not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      
      if (question.authorId !== user.id && user.role !== UserRole.ADMIN && user.role !== UserRole.MODERATOR) {
        throw new GraphQLError('Cannot close this question', {
          extensions: { code: 'FORBIDDEN' },
        });
      }
      
      return await prisma.question.update({
        where: { id },
        data: {
          status: QuestionStatus.CLOSED,
          closedAt: new Date(),
          closedBy: user.id
        },
        include: {
          author: true,
          channel: true,
          votes: true,
          files: true
        }
      });
    },

    // Vote mutations
    vote: async (_: any, { input }: { input: any }, context: Context) => {
      const user = requireAuth(context);
      const { targetId, targetType, type } = input;
      
      // Get user's vote weight based on role
      const voteWeight = user.role === UserRole.SPECIAL ? 5 : 
                        user.role === UserRole.MODERATOR ? 10 : 
                        user.role === UserRole.ADMIN ? 20 : 1;
      
      // Check if user already voted
      const existingVote = await prisma.vote.findUnique({
        where: {
          userId_targetId_targetType: {
            userId: user.id,
            targetId,
            targetType
          }
        }
      });
      
      if (existingVote) {
        // Update existing vote
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: {
            type,
            weight: voteWeight
          }
        });
      } else {
        // Create new vote
        await prisma.vote.create({
          data: {
            userId: user.id,
            targetId,
            targetType,
            type,
            weight: voteWeight
          }
        });
      }
      
      // Update vote count on target
      const votes = await prisma.vote.findMany({
        where: { targetId, targetType }
      });
      
      const voteCount = votes.reduce((sum, vote) => {
        return sum + (vote.type === VoteType.UP ? vote.weight : -vote.weight);
      }, 0);
      
      if (targetType === VoteTarget.MESSAGE) {
        await prisma.message.update({
          where: { id: targetId },
          data: { voteCount }
        });
      } else if (targetType === VoteTarget.QUESTION) {
        await prisma.question.update({
          where: { id: targetId },
          data: { voteCount }
        });
      }
      
      return { success: true, voteCount };
    },

    // File upload mutations
    createFileUploadUrl: async (_: any, { input }: { input: any }, context: Context) => {
      const user = requireAuth(context);
      const { filename, mimeType, size, type } = input;
      
      // Generate presigned URL (this would integrate with AWS S3)
      // For now, return a mock URL
      const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const uploadUrl = `https://s3.amazonaws.com/qup-files/${fileId}`;
      
      return {
        fileId,
        uploadUrl,
        fields: {} // Additional fields for S3 upload
      };
    },

    confirmFileUpload: async (_: any, { input }: { input: any }, context: Context) => {
      const user = requireAuth(context);
      const { fileId, filename, originalName, mimeType, size, type, url, messageId, questionId } = input;
      
      const file = await prisma.file.create({
        data: {
          filename,
          originalName,
          mimeType,
          size,
          type,
          url,
          uploadedBy: user.id,
          messageId,
          questionId
        }
      });
      
      return file;
    }
  },

  Subscription: {
    // Real-time subscriptions
    messageAdded: {
      subscribe: () => {
        // This would integrate with WebSocket/GraphQL subscriptions
        // For now, return a mock subscription
        return {
          next: (value: any) => value,
          return: () => {},
          throw: (error: any) => error
        };
      }
    },

    questionUpdated: {
      subscribe: () => {
        return {
          next: (value: any) => value,
          return: () => {},
          throw: (error: any) => error
        };
      }
    },

    voteUpdated: {
      subscribe: () => {
        return {
          next: (value: any) => value,
          return: () => {},
          throw: (error: any) => error
        };
      }
    }
  }
};
