export const LIMITS = {
  MESSAGE: {
    MAX_LENGTH: 10000,
    MAX_ATTACHMENTS: 10,
    MAX_MENTIONS: 50
  },
  QUESTION: {
    MAX_TITLE_LENGTH: 300,
    MAX_CONTENT_LENGTH: 10000,
    MAX_TAGS: 10,
    MIN_TITLE_LENGTH: 10,
    MIN_CONTENT_LENGTH: 20
  },
  FILE: {
    MAX_SIZE: 100 * 1024 * 1024, // 100MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'text/plain', 'application/msword']
  },
  USER: {
    MAX_USERNAME_LENGTH: 30,
    MIN_USERNAME_LENGTH: 3,
    MAX_DISPLAY_NAME_LENGTH: 100
  },
  CHANNEL: {
    MAX_NAME_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 500
  }
} as const;
