import { z } from 'zod';

export enum UserRole {
  NORMAL = 'NORMAL',
  SPECIAL = 'SPECIAL',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR'
}

export enum UserStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  AWAY = 'AWAY',
  DO_NOT_DISTURB = 'DO_NOT_DISTURB'
}

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string().min(3).max(30),
  displayName: z.string().min(1).max(100),
  avatar: z.string().url().optional(),
  role: z.nativeEnum(UserRole).default(UserRole.NORMAL),
  status: z.nativeEnum(UserStatus).default(UserStatus.OFFLINE),
  reputation: z.number().int().min(0).default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastSeenAt: z.date().optional(),
  pushToken: z.string().optional()
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  reputation: true,
  lastSeenAt: true
});

export const UpdateUserSchema = UserSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
