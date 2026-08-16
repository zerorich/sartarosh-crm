import { Suspense } from "react";
import { PhoneOtpFlow } from "@/components/auth/PhoneOtpFlow";

export default function LoginPage() {
  return (
    <Suspense>
      <PhoneOtpFlow heading="Xush kelibsiz" subheading="Davom etish uchun telefon raqamingizni kiriting" />
    </Suspense>
  );
}
