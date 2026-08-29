import { SignIn } from "@clerk/nextjs"

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center">
      <SignIn fallbackRedirectUrl="/panel" signUpUrl="/sign-up" />
    </div>
  )
}
