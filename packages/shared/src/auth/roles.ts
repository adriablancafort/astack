import { createAccessControl } from "better-auth/plugins/access"
import {
  adminAc,
  defaultStatements,
  memberAc,
  ownerAc,
} from "better-auth/plugins/organization/access"

const statement = {
  ...defaultStatements,
  todo: ["create", "update", "delete"],
}

export const ac = createAccessControl(statement)

export const owner = ac.newRole({
  ...ownerAc.statements,
  todo: ["create", "update", "delete"],
})

export const defaultRoles = {
  admin: {
    displayName: "Admin",
    permission: {
      ...adminAc.statements,
      todo: ["create", "update", "delete"],
    },
  },
  member: {
    displayName: "Member",
    permission: {
      ...memberAc.statements,
    },
  },
}
