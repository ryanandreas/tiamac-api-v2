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
import Link from 'next/link'

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Nama</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="Masukkan nama anda"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="no_telp">Nomor Telp</FieldLabel>
                <Input
                  id="no_telp"
                  type="tel"
                  placeholder="Masukkan nomor telp anda"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="Masukkan email anda"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="provinsi">Provinsi</FieldLabel>
                <select
                  id="provinsi"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue=""
                >
                  <option value="" disabled>Pilih Provinsi</option>
                  <option value="Jakarta Timur">Jakarta Timur</option>
                  <option value="Jakarta Selatan">Jakarta Selatan</option>
                  <option value="Jakarta Utara">Jakarta Utara</option>
                  <option value="Jakarta Barat">Jakarta Barat</option>
                </select>
              </Field>
              <Field>
                <FieldLabel htmlFor="alamat">Alamat</FieldLabel>
                <textarea
                  id="alamat"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Alamat lengkap anda"
                />
              </Field>
              <Field className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input id="password" type="password" placeholder="Password" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirm-password">
                    Confirm Password
                  </FieldLabel>
                  <Input id="confirm-password" type="password" placeholder="Confirm Password" required />
                </Field>
              </Field>
              <Field className="flex flex-col gap-2 sm:flex-row sm:gap-4">
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">Submit</Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/">Cancel</Link>
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Already have an account? <Link href="/login" className="underline underline-offset-4 hover:text-primary">Sign in</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <div className="text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
        By clicking continue, you agree to our <Link href="#">Terms of Service</Link>{" "}
        and <Link href="#">Privacy Policy</Link>.
      </div>
    </div>
  )
}
