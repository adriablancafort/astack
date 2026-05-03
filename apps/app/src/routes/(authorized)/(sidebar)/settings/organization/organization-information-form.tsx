import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon } from "lucide-react"
import * as React from "react"
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
import { organization } from "@/lib/auth-client"

type OrganizationInfo = {
  id: string
  name: string
  slug: string
}

const generalSchema = z.object({
  name: z.string().trim().min(1, "Organization name is required"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers and hyphens"
    ),
})

type GeneralFormValues = z.infer<typeof generalSchema>

export function OrganizationInformationForm({
  org,
}: {
  org: OrganizationInfo
}) {
  const [isSaving, setIsSaving] = React.useState(false)

  const form = useForm<GeneralFormValues>({
    resolver: zodResolver(generalSchema),
    defaultValues: {
      name: org.name,
      slug: org.slug,
    },
  })

  async function handleSubmit(values: GeneralFormValues) {
    setIsSaving(true)

    const result = await organization.update({
      data: { name: values.name, slug: values.slug },
      organizationId: org.id,
    })

    setIsSaving(false)

    if (result.error) {
      toast.error(result.error.message)
      return
    }

    toast.success("Organization updated")
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Organization information</FieldLegend>
          <FieldDescription>
            Update your organization name and URL slug
          </FieldDescription>
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
                placeholder="Acme Inc"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="slug"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Slug</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="acme-inc"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button type="submit">
          {isSaving ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            "Save changes"
          )}
        </Button>
      </FieldGroup>
    </form>
  )
}
