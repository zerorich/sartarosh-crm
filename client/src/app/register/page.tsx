import { Suspense } from "react";
import { EmailOtpFlow } from "@/components/auth/EmailOtpFlow";

export default function RegisterPage() {
  return (
    <Suspense>
      <EmailOtpFlow
        heading="Ro'yxatdan o'tish"
        subheading="Gmail manzilingizga bir martalik kod yuboramiz"
        askName
      />
    </Suspense>
  );
}
