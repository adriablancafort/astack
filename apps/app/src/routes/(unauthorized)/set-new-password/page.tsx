import { zodResolver } from "@hookform/resolvers/zod"
import {
  createFileRoute,
  Link,
  useLocation,
  useNavigate,
} from "@tanstack/react-router"
import { Loader2Icon } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { toast } from "@workspace/ui/components/sonner"
import { resetPassword } from "@/lib/auth-client"

export const Route = createFileRoute("/(unauthorized)/set-new-password/")({
  component: Page,
})

function Page() {
  const navigate = useNavigate()
  const location = useLocation()
  const token = new URLSearchParams(location.search).get("token")

  const setNewPasswordFormSchema = z
    .object({
      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must include at least one uppercase letter")
        .regex(/[a-z]/, "Password must include at least one lowercase letter")
        .regex(/[0-9]/, "Password must include at least one number"),
      confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((values) => values.password === values.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    })

  type SetNewPasswordFormValues = z.infer<typeof setNewPasswordFormSchema>

  const form = useForm<SetNewPasswordFormValues>({
    resolver: zodResolver(setNewPasswordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: SetNewPasswordFormValues) {
    if (!token) {
      toast.error("Invalid or missing reset token")
      return
    }

    const result = await resetPassword({
      newPassword: values.password,
      token,
    })

    if (result.error) {
      toast.error(result.error.message)
      return
    }

    toast.success("New password set")
    navigate({ to: "/signin" })
  }

  if (!token) {
    return null
  }

  return (
    <div className="flex h-screen w-full items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Set new password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="password"
                      autoComplete="new-password"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Confirm Password
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="password"
                      autoComplete="new-password"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  "Set new password"
                )}
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">
                  Already remember it?{" "}
                </span>
                <Link to="/signin" className="underline underline-offset-3">
                  Sign in
                </Link>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
