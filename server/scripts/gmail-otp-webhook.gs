/**
 * Google Apps Script mail webhook — sends OTP as zerorich207@gmail.com (no custom domain).
 *
 * Setup (2 minutes, while logged into that Gmail):
 * 1. https://script.google.com  → New project
 * 2. Replace Code.gs with this file
 * 3. Project Settings → Script properties → Add:
 *      WEBHOOK_SECRET = (same value as EMAIL_WEBHOOK_SECRET on Railway)
 * 4. Deploy → New deployment → Type: Web app
 *      Execute as: Me
 *      Who has access: Anyone
 * 5. Copy the Web app URL (…/macros/s/…/exec) into Railway EMAIL_WEBHOOK_URL
 */
function doPost(e) {
  const output = ContentService.createTextOutput;
  const json = function (obj) {
    return output(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
  };

  try {
    const secret = PropertiesService.getScriptProperties().getProperty("WEBHOOK_SECRET") || "";
    const payload = JSON.parse(e.postData.contents);

    if (!secret || payload.secret !== secret) {
      return json({ ok: false, error: "unauthorized" });
    }

    const to = String(payload.to || "").trim();
    const subject = String(payload.subject || "Sartarosh");
    const text = String(payload.text || "");
    const html = payload.html ? String(payload.html) : undefined;

    if (!to) {
      return json({ ok: false, error: "missing_to" });
    }

    GmailApp.sendEmail(to, subject, text, {
      htmlBody: html,
      name: "Sartarosh",
    });

    return json({ ok: true });
  } catch (error) {
    return json({ ok: false, error: String(error) });
  }
}
