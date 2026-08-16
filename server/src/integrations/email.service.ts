import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { env } from "../config/env";

function hasGmailCredentials(): boolean {
  return Boolean(env.GMAIL_USER && env.GMAIL_APP_PASSWORD);
}

function hasResendCredentials(): boolean {
  return Boolean(env.RESEND_API_KEY);
}

function getSmtpFromAddress(): string {
  return env.SMTP_FROM || env.GMAIL_USER;
}

/** Resend cannot send as gmail.com — use a verified domain or the onboarding sender. */
function getResendFromAddress(): string {
  if (env.RESEND_FROM) return env.RESEND_FROM;
  const smtpFrom = env.SMTP_FROM;
  if (smtpFrom && !/@gmail\.com\b/i.test(smtpFrom)) return smtpFrom;
  return "Sartarosh <onboarding@resend.dev>";
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      connectionTimeout: 8_000,
      greetingTimeout: 8_000,
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

function otpText(otp: string): string {
  return `Your Sartarosh verification code is ${otp}. It expires in a few minutes.`;
}

async function sendViaResend(to: string, otp: string): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getResendFromAddress(),
      to: [to],
      subject: "Your Sartarosh verification code",
      text: otpText(otp),
      html: buildOtpHtml(otp),
    }),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(`[email] Resend HTTP ${response.status}${details ? `: ${details.slice(0, 300)}` : ""}`);
  }
}

async function sendViaGmail(to: string, otp: string): Promise<void> {
  await getTransporter().sendMail({
    from: getSmtpFromAddress(),
    to,
    subject: "Your Sartarosh verification code",
    text: otpText(otp),
    html: buildOtpHtml(otp),
  });
}

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  if (hasResendCredentials()) {
    await sendViaResend(to, otp);
    return;
  }

  if (hasGmailCredentials()) {
    if (env.NODE_ENV === "production") {
      console.warn(
        "[email] Using Gmail SMTP in production. Railway Hobby blocks ports 587/465 — set RESEND_API_KEY (HTTPS) if send fails.",
      );
    }
    await sendViaGmail(to, otp);
    return;
  }

  if (env.NODE_ENV === "production") {
    const message =
      "[email] Set RESEND_API_KEY (recommended on Railway) or GMAIL_USER + GMAIL_APP_PASSWORD; OTP was not sent";
    console.error(`${message} (recipient=${to})`);
    throw new Error(message);
  }

  console.info(`[email] OTP for ${to}: ${otp}`);
}
