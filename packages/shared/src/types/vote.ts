import { z } from 'zod';

export enum VoteType {
  UP = 'UP',
  DOWN = 'DOWN'
}

export enum VoteTarget {
  MESSAGE = 'MESSAGE',
  QUESTION = 'QUESTION',
  ANSWER = 'ANSWER'
}

export const VoteSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  targetId: z.string().uuid(),
  targetType: z.nativeEnum(VoteTarget),
  type: z.nativeEnum(VoteType),
  weight: z.number().int().min(1).default(1), // Special users have higher weight
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Vote = z.infer<typeof VoteSchema>;

export const CreateVoteSchema = VoteSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const UpdateVoteSchema = VoteSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
  targetId: true,
  targetType: true
});
