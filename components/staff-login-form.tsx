'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useActionState } from "react"
import { loginStaff } from "@/app/actions/auth"

export function StaffLoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [state, formAction, isPending] = useActionState(loginStaff, null)

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 h-[500px]">
        <CardContent className="grid p-0 md:grid-cols-2 h-full">
          <div className="relative hidden md:flex flex-col items-center justify-center p-8 h-full bg-card">
            <div className="flex flex-col items-center gap-4 text-center">
              <h2 className="text-xl font-semibold">Are you a Customer?</h2>
              <p className="text-sm text-muted-foreground">
                Login here to access your personal dashboard and orders.
              </p>
              <Button asChild variant="outline" className="w-full max-w-xs">
                <a href="/login">Login as Customer</a>
              </Button>
            </div>
          </div>
          <form action={formAction} className="p-6 md:p-8 flex flex-col justify-center h-full">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Staff Login</h1>
                <p className="text-balance text-muted-foreground">
                  Login to access staff portal
                </p>
              </div>
              {state?.message && (
                <div className="text-red-500 text-sm text-center font-medium">
                  {state.message}
                </div>
              )}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="staff@example.com"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input id="password" name="password" type="password" required />
              </Field>
              <Field>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Logging in..." : "Login"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <div className="text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
