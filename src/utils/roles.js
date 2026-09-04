export const STORE_ROLES = ['STORE_OWNER', 'STORE_MEMBER'];

export const isStoreAdmin = (user) => {
  if (!user?.role) return false;
  return STORE_ROLES.includes(user.role);
};

export const isStoreOwner = (user) => user?.role === 'STORE_OWNER';

export const hasPermission = (user, permission) => {
  if (!user) return false;
  if (user.role === 'STORE_OWNER') return true;
  if (user.role !== 'STORE_MEMBER') return false;
  const perms = user.permissions || [];
  return perms.includes(permission);
};

export const canAccessAdmin = (user) => isStoreAdmin(user);
