import { zodResolver } from "@hookform/resolvers/zod"
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
import { organization } from "@/lib/auth-client"

export default function Page() {
  const createOrganizationSchema = z.object({
    name: z.string().trim().min(1, "Organization name is required"),
  })

  type CreateOrganizationFormValues = z.infer<typeof createOrganizationSchema>

  const form = useForm<CreateOrganizationFormValues>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: "",
    },
  })

  async function onSubmit(values: CreateOrganizationFormValues) {
    await organization.create(
      {
        name: values.name.trim(),
        slug: crypto.randomUUID(),
        keepCurrentActiveOrganization: false,
      },
      {
        onError: (ctx) => {
          toast.error(ctx.error.message)
        },
        onSuccess: () => {
          toast.success("Organization created")
          // Reset organizations client state
          window.location.assign("/")
        },
      }
    )
  }

  return (
    <div className="flex h-screen w-full items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create organization</CardTitle>
          <CardDescription>
            Enter your organization name below to create your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Organization name
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder="Acme Inc"
                      aria-invalid={fieldState.invalid}
                      autoFocus
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Field>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                    "Create organization"
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
