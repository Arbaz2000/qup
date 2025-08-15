import { z } from 'zod';

export enum QuestionStatus {
  OPEN = 'OPEN',
  ANSWERED = 'ANSWERED',
  CLOSED = 'CLOSED',
  DUPLICATE = 'DUPLICATE'
}

export const QuestionSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(10).max(300),
  content: z.string().min(20).max(10000),
  authorId: z.string().uuid(),
  channelId: z.string().uuid(),
  tags: z.array(z.string()).default([]),
  status: z.nativeEnum(QuestionStatus).default(QuestionStatus.OPEN),
  viewCount: z.number().int().min(0).default(0),
  answerCount: z.number().int().min(0).default(0),
  voteCount: z.number().int().default(0),
  bestAnswerId: z.string().uuid().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  closedAt: z.date().optional(),
  closedBy: z.string().uuid().optional()
});

export type Question = z.infer<typeof QuestionSchema>;

export const CreateQuestionSchema = QuestionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
  answerCount: true,
  voteCount: true,
  closedAt: true,
  closedBy: true
});

export const UpdateQuestionSchema = QuestionSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  authorId: true
});
