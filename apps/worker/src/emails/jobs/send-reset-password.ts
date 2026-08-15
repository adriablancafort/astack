export type SendResetPasswordPayload = {
  to: string
  name: string
  url: string
}

export async function sendResetPassword(payload: SendResetPasswordPayload) {
  console.log("send-reset-password", payload)
}
