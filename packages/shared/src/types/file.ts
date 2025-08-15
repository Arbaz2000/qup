import { z } from 'zod';

export enum FileType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  AUDIO = 'AUDIO'
}

export const FileSchema = z.object({
  id: z.string().uuid(),
  filename: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number().int().min(0),
  type: z.nativeEnum(FileType),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  uploadedBy: z.string().uuid(),
  messageId: z.string().uuid().optional(),
  questionId: z.string().uuid().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type File = z.infer<typeof FileSchema>;

export const CreateFileSchema = FileSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
