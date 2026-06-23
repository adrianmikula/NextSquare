export function isOwner(roles: string[]): boolean {
  return roles.includes("owner")
}

export function isStaff(roles: string[]): boolean {
  return roles.includes("staff") || roles.includes("owner")
}

export function isVisitor(roles: string[]): boolean {
  return !roles.includes("owner") && !roles.includes("staff") && !roles.includes("developer")
}

export function isDeveloper(roles: string[]): boolean {
  return roles.includes("developer")
}

export function canEditCatalog(roles: string[]): boolean {
  return isOwner(roles)
}

export function canEditStock(roles: string[]): boolean {
  return isStaff(roles)
}

export function canManageSettings(roles: string[]): boolean {
  return isDeveloper(roles) || isOwner(roles)
}
