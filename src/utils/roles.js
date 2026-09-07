export const STORE_ROLES = ['STORE_OWNER', 'STORE_MEMBER'];
export const PLATFORM_ROLES = ['PLATFORM_ADMIN', 'PLATFORM_SUPPORT'];

export const isStoreAdmin = (user) => {
  if (!user?.role) return false;
  return STORE_ROLES.includes(user.role);
};

export const isStoreOwner = (user) => user?.role === 'STORE_OWNER';

export const isPlatformOperator = (user) => {
  if (!user?.role) return false;
  return PLATFORM_ROLES.includes(user.role);
};

export const hasPermission = (user, permission) => {
  if (!user) return false;
  if (user.role === 'STORE_OWNER') return true;
  if (user.role !== 'STORE_MEMBER') return false;
  const perms = user.permissions || [];
  return perms.includes(permission);
};

export const canAccessAdmin = (user) => isStoreAdmin(user);

/** Who may load the /admin shell at all — store team plus platform operators. */
export const canAccessAdminShell = (user) => isStoreAdmin(user) || isPlatformOperator(user);
