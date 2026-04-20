import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"
import { signOut } from "@/lib/auth-client"

export default function Page() {
  async function handleSignOut() {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Signed out successfully")
        },
        onError: (ctx) => {
          toast.error(ctx.error.message)
        },
      },
    })
  }

  return (
    <div className="flex h-screen items-center justify-center p-6">
      <Button onClick={handleSignOut}>Sign Out</Button>
    </div>
  )
}
