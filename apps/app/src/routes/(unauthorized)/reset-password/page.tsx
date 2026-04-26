import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { Link } from "react-router"
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
import { requestPasswordReset } from "@/lib/auth-client"
import { env } from "@/lib/env"

export default function Page() {
  const recoverPasswordFormSchema = z.object({
    email: z.email("Enter a valid email address"),
  })

  type RecoverPasswordFormValues = z.infer<typeof recoverPasswordFormSchema>

  const form = useForm<RecoverPasswordFormValues>({
    resolver: zodResolver(recoverPasswordFormSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: RecoverPasswordFormValues) {
    await requestPasswordReset(
      {
        email: values.email,
        redirectTo: `${env.FRONTEND_URL}/set-new-password`,
      },
      {
        onSuccess: () => {
          toast.success(
            "If an account exists for that email, a reset link has been sent"
          )
          form.reset()
        },
        onError: (ctx) => {
          toast.error(ctx.error.message)
        },
      }
    )
  }

  return (
    <div className="flex h-screen w-full items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Reset password</CardTitle>
          <CardDescription>
            Enter your email below to receive a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="email"
                      placeholder="mail@example.com"
                      autoComplete="email"
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
                  "Send reset link"
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
