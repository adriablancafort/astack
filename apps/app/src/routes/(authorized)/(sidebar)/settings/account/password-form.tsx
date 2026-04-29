import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { toast } from "@workspace/ui/components/sonner"
import { changePassword } from "@/lib/auth-client"

export function AccountPasswordForm() {
  const passwordSchema = z
    .object({
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must include at least one uppercase letter")
        .regex(/[a-z]/, "Password must include at least one lowercase letter")
        .regex(/[0-9]/, "Password must include at least one number"),
      confirmPassword: z.string().min(1, "Please confirm your new password"),
    })
    .refine((values) => values.newPassword === values.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    })

  type PasswordFormValues = z.infer<typeof passwordSchema>

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  async function handleSubmit(values: PasswordFormValues) {
    const result = await changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
      revokeOtherSessions: true,
    })

    if (result.error) {
      toast.error(result.error.message)
      return
    }

    toast.success("New password set")
    form.reset()
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Password</FieldLegend>
          <FieldDescription>Set a new password</FieldDescription>
        </FieldSet>

        <Controller
          name="currentPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Current password</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="password"
                autoComplete="current-password"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="newPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>New password</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="password"
                autoComplete="new-password"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Confirm new password</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="password"
                autoComplete="new-password"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
      </FieldGroup>
    </form>
  )
}
