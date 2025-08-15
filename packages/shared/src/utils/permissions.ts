import { UserRole, ROLE_PERMISSIONS } from '../constants/roles';

export function hasPermission(userRole: UserRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission as any);
}

export function canModerate(userRole: UserRole): boolean {
  return hasPermission(userRole, 'moderate_own_channel');
}

export function canDeleteAnyMessage(userRole: UserRole): boolean {
  return hasPermission(userRole, 'delete_any_message');
}

export function canManageUsers(userRole: UserRole): boolean {
  return hasPermission(userRole, 'manage_users');
}

export function canManageRoles(userRole: UserRole): boolean {
  return hasPermission(userRole, 'manage_roles');
}
