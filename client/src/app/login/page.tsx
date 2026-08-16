import { Suspense } from "react";
import { EmailOtpFlow } from "@/components/auth/EmailOtpFlow";

export default function LoginPage() {
  return (
    <Suspense>
      <EmailOtpFlow heading="Xush kelibsiz" subheading="Davom etish uchun Gmail manzilingizni kiriting" />
    </Suspense>
  );
}
