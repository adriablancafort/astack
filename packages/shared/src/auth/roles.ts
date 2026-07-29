import { createAccessControl } from "better-auth/plugins/access"
import {
  adminAc,
  defaultStatements,
  memberAc,
  ownerAc,
} from "better-auth/plugins/organization/access"

export const statement = {
  ...defaultStatements,
  todo: ["create", "update", "delete"],
}

export const ac = createAccessControl(statement)

export const owner = ac.newRole({
  ...ownerAc.statements,
  todo: ["create", "update", "delete"],
})

export const admin = ac.newRole({
  ...adminAc.statements,
  todo: ["create", "update", "delete"],
})

export const member = ac.newRole({
  ...memberAc.statements,
  todo: [],
})

export const roles = { owner, admin, member }

export type RoleKeys = keyof typeof roles
