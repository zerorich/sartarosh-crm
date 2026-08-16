import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { env } from "../config/env";

function hasGmailCredentials(): boolean {
  return Boolean(env.GMAIL_USER && env.GMAIL_APP_PASSWORD);
}

function getFromAddress(): string {
  return env.SMTP_FROM || env.GMAIL_USER;
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    // Prefer SMTPS 465 + IPv4. Railway hobby often blocks :587 and has no IPv6 egress.
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      family: 4,
      connectionTimeout: 12_000,
      greetingTimeout: 12_000,
      auth: {
        user: env.GMAIL_USER,
        pass: env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return transporter;
}

function buildOtpHtml(otp: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Your verification code</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
  <p>Use this code to sign in to Sartarosh:</p>
  <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px; margin: 16px 0;">${otp}</p>
  <p style="color: #555;">This code expires in a few minutes. If you did not request it, you can ignore this email.</p>
</body>
</html>`;
}

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  if (!hasGmailCredentials()) {
    if (env.NODE_ENV === "production") {
      const message =
        "[email] GMAIL_USER and GMAIL_APP_PASSWORD must be set in production; OTP was not sent";
      console.error(`${message} (recipient=${to})`);
      throw new Error(message);
    }

    console.info(`[email] OTP for ${to}: ${otp}`);
    return;
  }

  const from = getFromAddress();
  await getTransporter().sendMail({
    from,
    to,
    subject: "Your Sartarosh verification code",
    text: `Your Sartarosh verification code is ${otp}. It expires in a few minutes.`,
    html: buildOtpHtml(otp),
  });
}
