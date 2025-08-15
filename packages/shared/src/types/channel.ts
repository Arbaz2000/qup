import { z } from 'zod';

export enum ChannelType {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  DIRECT = 'DIRECT'
}

export const ChannelSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  type: z.nativeEnum(ChannelType),
  workspaceId: z.string().uuid(),
  createdBy: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  memberCount: z.number().int().min(0).default(0),
  isArchived: z.boolean().default(false)
});

export type Channel = z.infer<typeof ChannelSchema>;

export const CreateChannelSchema = ChannelSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  memberCount: true
});

export const UpdateChannelSchema = ChannelSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true
});
