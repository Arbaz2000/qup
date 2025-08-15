import { z } from 'zod';

export enum MessageType {
  TEXT = 'TEXT',
  QUESTION = 'QUESTION',
  ANSWER = 'ANSWER',
  COMMENT = 'COMMENT',
  SYSTEM = 'SYSTEM'
}

export const MessageSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1).max(10000),
  type: z.nativeEnum(MessageType),
  channelId: z.string().uuid(),
  authorId: z.string().uuid(),
  parentId: z.string().uuid().optional(), // For replies/comments
  questionId: z.string().uuid().optional(), // For answers/comments on questions
  attachments: z.array(z.string().uuid()).default([]), // File IDs
  mentions: z.array(z.string().uuid()).default([]), // User IDs
  createdAt: z.date(),
  updatedAt: z.date(),
  isEdited: z.boolean().default(false),
  isDeleted: z.boolean().default(false)
});

export type Message = z.infer<typeof MessageSchema>;

export const CreateMessageSchema = MessageSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isEdited: true,
  isDeleted: true
});

export const UpdateMessageSchema = MessageSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  authorId: true,
  channelId: true
});
