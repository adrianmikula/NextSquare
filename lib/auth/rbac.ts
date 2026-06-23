export type Role = "visitor" | "owner" | "staff" | "developer"

const ROLE_HIERARCHY: Record<Role, number> = {
  visitor: 0,
  staff: 1,
  developer: 2,
  owner: 3,
}

export function hasRole(userRoles: string[], required: Role[]): boolean {
  return required.some((role) => userRoles.includes(role))
}

export function hasMinimumRole(userRoles: string[], minimum: Role): boolean {
  const userLevel = Math.max(...userRoles.map((r) => ROLE_HIERARCHY[r as Role] ?? -1))
  return userLevel >= ROLE_HIERARCHY[minimum]
}

export function canEditCatalog(roles: string[]): boolean {
  return hasRole(roles, ["owner"])
}

export function canEditStock(roles: string[]): boolean {
  return hasRole(roles, ["owner", "staff"])
}

export function canManageSettings(roles: string[]): boolean {
  return hasRole(roles, ["owner", "developer"])
}

export function isVisitorOnly(roles: string[]): boolean {
  return roles.length === 1 && roles.includes("visitor")
}
