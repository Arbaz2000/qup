import { LIMITS } from '../constants/limits';

export function validateMessageContent(content: string): { isValid: boolean; error?: string } {
  if (!content || content.trim().length === 0) {
    return { isValid: false, error: 'Message content cannot be empty' };
  }
  
  if (content.length > LIMITS.MESSAGE.MAX_LENGTH) {
    return { 
      isValid: false, 
      error: `Message content cannot exceed ${LIMITS.MESSAGE.MAX_LENGTH} characters` 
    };
  }
  
  return { isValid: true };
}

export function validateQuestionTitle(title: string): { isValid: boolean; error?: string } {
  if (!title || title.trim().length === 0) {
    return { isValid: false, error: 'Question title cannot be empty' };
  }
  
  if (title.length < LIMITS.QUESTION.MIN_TITLE_LENGTH) {
    return { 
      isValid: false, 
      error: `Question title must be at least ${LIMITS.QUESTION.MIN_TITLE_LENGTH} characters` 
    };
  }
  
  if (title.length > LIMITS.QUESTION.MAX_TITLE_LENGTH) {
    return { 
      isValid: false, 
      error: `Question title cannot exceed ${LIMITS.QUESTION.MAX_TITLE_LENGTH} characters` 
    };
  }
  
  return { isValid: true };
}

export function validateQuestionContent(content: string): { isValid: boolean; error?: string } {
  if (!content || content.trim().length === 0) {
    return { isValid: false, error: 'Question content cannot be empty' };
  }
  
  if (content.length < LIMITS.QUESTION.MIN_CONTENT_LENGTH) {
    return { 
      isValid: false, 
      error: `Question content must be at least ${LIMITS.QUESTION.MIN_CONTENT_LENGTH} characters` 
    };
  }
  
  if (content.length > LIMITS.QUESTION.MAX_CONTENT_LENGTH) {
    return { 
      isValid: false, 
      error: `Question content cannot exceed ${LIMITS.QUESTION.MAX_CONTENT_LENGTH} characters` 
    };
  }
  
  return { isValid: true };
}

export function validateUsername(username: string): { isValid: boolean; error?: string } {
  if (!username || username.trim().length === 0) {
    return { isValid: false, error: 'Username cannot be empty' };
  }
  
  if (username.length < LIMITS.USER.MIN_USERNAME_LENGTH) {
    return { 
      isValid: false, 
      error: `Username must be at least ${LIMITS.USER.MIN_USERNAME_LENGTH} characters` 
    };
  }
  
  if (username.length > LIMITS.USER.MAX_USERNAME_LENGTH) {
    return { 
      isValid: false, 
      error: `Username cannot exceed ${LIMITS.USER.MAX_USERNAME_LENGTH} characters` 
    };
  }
  
  // Username can only contain alphanumeric characters, underscores, and hyphens
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(username)) {
    return { 
      isValid: false, 
      error: 'Username can only contain letters, numbers, underscores, and hyphens' 
    };
  }
  
  return { isValid: true };
}
