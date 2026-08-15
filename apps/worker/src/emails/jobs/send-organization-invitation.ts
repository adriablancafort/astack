export type SendOrganizationInvitationPayload = {
  to: string
  url: string
  organizationName: string
}

export async function sendOrganizationInvitation(
  payload: SendOrganizationInvitationPayload
) {
  console.log("send-organization-invitation", payload)
}
