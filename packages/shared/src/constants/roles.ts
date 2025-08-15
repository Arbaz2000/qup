import { UserRole } from '../types/user';

export const ROLE_WEIGHTS = {
  [UserRole.NORMAL]: 1,
  [UserRole.SPECIAL]: 5,
  [UserRole.MODERATOR]: 10,
  [UserRole.ADMIN]: 20
} as const;

export const ROLE_PERMISSIONS = {
  [UserRole.NORMAL]: [
    'send_messages',
    'vote',
    'ask_questions',
    'answer_questions',
    'edit_own_messages',
    'delete_own_messages'
  ],
  [UserRole.SPECIAL]: [
    'send_messages',
    'vote',
    'ask_questions',
    'answer_questions',
    'edit_own_messages',
    'delete_own_messages',
    'pin_messages',
    'moderate_own_channel'
  ],
  [UserRole.MODERATOR]: [
    'send_messages',
    'vote',
    'ask_questions',
    'answer_questions',
    'edit_own_messages',
    'delete_own_messages',
    'pin_messages',
    'moderate_own_channel',
    'delete_any_message',
    'ban_users',
    'close_questions',
    'mark_best_answer'
  ],
  [UserRole.ADMIN]: [
    'send_messages',
    'vote',
    'ask_questions',
    'answer_questions',
    'edit_own_messages',
    'delete_own_messages',
    'pin_messages',
    'moderate_own_channel',
    'delete_any_message',
    'ban_users',
    'close_questions',
    'mark_best_answer',
    'manage_users',
    'manage_channels',
    'manage_roles',
    'system_settings'
  ]
} as const;
