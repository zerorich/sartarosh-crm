import { Suspense } from "react";
import { PhoneOtpFlow } from "@/components/auth/PhoneOtpFlow";

export default function RegisterPage() {
  return (
    <Suspense>
      <PhoneOtpFlow
        heading="Ro'yxatdan o'tish"
        subheading="Telefon raqamingizga bir martalik kod yuboramiz"
        askName
      />
    </Suspense>
  );
}
