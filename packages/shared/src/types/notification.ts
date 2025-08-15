import { z } from 'zod';

export enum NotificationType {
  MESSAGE = 'MESSAGE',
  MENTION = 'MENTION',
  VOTE = 'VOTE',
  ANSWER = 'ANSWER',
  QUESTION_ANSWERED = 'QUESTION_ANSWERED',
  SYSTEM = 'SYSTEM'
}

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.nativeEnum(NotificationType),
  title: z.string(),
  message: z.string(),
  data: z.record(z.any()).optional(),
  isRead: z.boolean().default(false),
  createdAt: z.date(),
  readAt: z.date().optional()
});

export type Notification = z.infer<typeof NotificationSchema>;

export const CreateNotificationSchema = NotificationSchema.omit({
  id: true,
  createdAt: true,
  readAt: true
});
