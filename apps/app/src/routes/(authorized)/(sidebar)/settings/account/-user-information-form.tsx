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
import { updateUser, useSession } from "@/lib/auth-client"

export function UserInformationForm() {
  const userInformationSchema = z.object({
    name: z.string().trim().min(1, "Name cannot be empty"),
  })

  type UserInformationFormValues = z.infer<typeof userInformationSchema>

  const { data: session, isPending: isSessionPending } = useSession()

  const name = session?.user.name ?? ""
  const email = session?.user.email ?? ""

  const form = useForm<UserInformationFormValues>({
    resolver: zodResolver(userInformationSchema),
    defaultValues: {
      name,
    },
  })

  async function handleSubmit(values: UserInformationFormValues) {
    const result = await updateUser({
      name: values.name,
    })

    if (result.error) {
      toast.error(result.error.message)
      return
    }

    toast.success("Account information updated")
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Account information</FieldLegend>
          <FieldDescription>Update your account information</FieldDescription>
        </FieldSet>

        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                autoComplete="name"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" value={email} disabled readOnly />
        </Field>

        <Button
          type="submit"
          disabled={isSessionPending || form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            "Save changes"
          )}
        </Button>
      </FieldGroup>
    </form>
  )
}
