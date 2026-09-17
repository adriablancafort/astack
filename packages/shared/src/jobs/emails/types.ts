export type SendResetPasswordPayload = {
  to: string
  name: string
  url: string
}

export type SendOrganizationInvitationPayload = {
  to: string
  url: string
  organizationName: string
}
