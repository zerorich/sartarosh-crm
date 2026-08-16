export interface ExternalDeliveryResult {
  inApp: "delivered";
  sms: "skipped" | "sent";
  email: "skipped" | "sent";
}

/**
 * SMS/email adapter. In-app notifications are already persisted before enqueue.
 * External channels are a no-op until a provider is configured.
 */
export async function deliverExternalChannels(notification: {
  id: string;
  userId: string;
  type: string;
  title: string;
}): Promise<ExternalDeliveryResult> {
  console.log(
    `[notify:sms] skipped notification=${notification.id} user=${notification.userId} type=${notification.type}`,
  );
  console.log(
    `[notify:email] skipped notification=${notification.id} user=${notification.userId} type=${notification.type}`,
  );
  return { inApp: "delivered", sms: "skipped", email: "skipped" };
}
