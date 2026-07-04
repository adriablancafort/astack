import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
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
import { Spinner } from "@/components/spinner"
import { organization } from "@/lib/auth-client"

export const Route = createFileRoute("/(authorized)/create-organization/")({
  component: Page,
})

function Page() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

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

  const createOrganizationMutation = useMutation({
    mutationFn: async (values: CreateOrganizationFormValues) => {
      const result = await organization.create({
        name: values.name.trim(),
        slug: crypto.randomUUID(),
        keepCurrentActiveOrganization: false,
      })

      if (result.error) {
        throw new Error(result.error.message)
      }
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ["session"] })
      toast.success("Organization created")
      navigate({ to: "/" })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  return (
    <div className="flex h-screen w-full items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create organization</CardTitle>
          <CardDescription>
            Enter a name below to create an organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit((values) =>
              createOrganizationMutation.mutate(values)
            )}
            noValidate
          >
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
                      disabled={createOrganizationMutation.isPending}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Field>
                <Button
                  type="submit"
                  disabled={createOrganizationMutation.isPending}
                >
                  {createOrganizationMutation.isPending ? (
                    <Spinner />
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
