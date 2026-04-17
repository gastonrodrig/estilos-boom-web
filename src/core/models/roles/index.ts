export type Role = {
  idRol: string
  descripcion: string
}

export type RoleState = {
  roles: Role[]
  selected: Role | null
  total: number
  currentPage: number
  rowsPerPage: number
  totalPages: number
  loading: boolean
}

export type RefreshRolesPayload = {
  items: Role[]
  total: number
  page: number
  perPage: number
  totalPages: number
}
