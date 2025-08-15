import { LIMITS } from '../constants/limits';

export function validateFileSize(size: number): { isValid: boolean; error?: string } {
  if (size > LIMITS.FILE.MAX_SIZE) {
    return { 
      isValid: false, 
      error: `File size cannot exceed ${LIMITS.FILE.MAX_SIZE / (1024 * 1024)}MB` 
    };
  }
  
  return { isValid: true };
}

export function validateImageType(mimeType: string): { isValid: boolean; error?: string } {
  if (!LIMITS.FILE.ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    return { 
      isValid: false, 
      error: `Image type not allowed. Allowed types: ${LIMITS.FILE.ALLOWED_IMAGE_TYPES.join(', ')}` 
    };
  }
  
  return { isValid: true };
}

export function validateVideoType(mimeType: string): { isValid: boolean; error?: string } {
  if (!LIMITS.FILE.ALLOWED_VIDEO_TYPES.includes(mimeType)) {
    return { 
      isValid: false, 
      error: `Video type not allowed. Allowed types: ${LIMITS.FILE.ALLOWED_VIDEO_TYPES.join(', ')}` 
    };
  }
  
  return { isValid: true };
}

export function validateDocumentType(mimeType: string): { isValid: boolean; error?: string } {
  if (!LIMITS.FILE.ALLOWED_DOCUMENT_TYPES.includes(mimeType)) {
    return { 
      isValid: false, 
      error: `Document type not allowed. Allowed types: ${LIMITS.FILE.ALLOWED_DOCUMENT_TYPES.join(', ')}` 
    };
  }
  
  return { isValid: true };
}

export function getFileTypeFromMimeType(mimeType: string): 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'AUDIO' {
  if (LIMITS.FILE.ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    return 'IMAGE';
  }
  
  if (LIMITS.FILE.ALLOWED_VIDEO_TYPES.includes(mimeType)) {
    return 'VIDEO';
  }
  
  if (LIMITS.FILE.ALLOWED_DOCUMENT_TYPES.includes(mimeType)) {
    return 'DOCUMENT';
  }
  
  return 'AUDIO';
}

export function generateFileName(originalName: string, userId: string): string {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop();
  return `${userId}_${timestamp}.${extension}`;
}
