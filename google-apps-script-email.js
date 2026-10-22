/*
========================================
THE PRAYER PROJECT
GOOGLE APPS SCRIPT EMAIL SYSTEM
========================================

This version does NOT use Google Sheets.
The website sends the requester's email directly to this script.
The email is never displayed on the public website.

After editing this file in Apps Script, you must deploy a NEW web app version.
*/

const ADMIN_EMAIL = "christophershelley257@gmail.com";

function doGet() {
  return response({
    success: true,
    message: "The Prayer Project email service is running."
  });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return response({
        success: false,
        message: "No request body received."
      });
    }

    const data = JSON.parse(e.postData.contents);

    const email = sanitize(data.email);
    const requestTitle = sanitize(data.requestTitle || "Prayer Request");
    const requestMessage = sanitize(data.requestMessage || "");
    const prayerCount = Number(data.prayerCount || 1);

    if (!isValidEmail(email)) {
      return response({
        success: false,
        message: "Invalid or missing recipient email."
      });
    }

    // MailApp requires a plain-text body even when htmlBody is provided.
    // Without it, the sendEmail(message) call fails.
    if (MailApp.getRemainingDailyQuota() < 1) {
      return response({
        success: false,
        code: "EMAIL_QUOTA_EXCEEDED",
        message: "The daily email recipient quota has been reached."
      });
    }

    MailApp.sendEmail({
      to: email,
      subject: "Someone Prayed For You",
      body: "Someone prayed for you today.\n\nPrayer Request: " + requestTitle +
        "\n\n" + requestMessage + "\n\nTotal prayers received: " + prayerCount +
        "\n\nThe Prayer Project — ask4prayers.com",
      htmlBody: buildPrayerEmailHtml(requestTitle, requestMessage, prayerCount),
      name: "The Prayer Project"
    });

    // An optional admin copy must never turn a successful recipient send into
    // a false failure, or double-send to the same inbox during testing.
    if (isValidEmail(ADMIN_EMAIL) &&
        ADMIN_EMAIL.toLowerCase() !== email.toLowerCase() &&
        MailApp.getRemainingDailyQuota() > 0) {
      try {
        MailApp.sendEmail({
        to: ADMIN_EMAIL,
        subject: "Prayer Notification Sent",
        body: "A prayer notification was sent.\nRecipient: " + email +
          "\nPrayer count: " + prayerCount + "\nRequest: " + requestTitle,
        htmlBody: `
          <h2>Prayer Notification Sent</h2>
          <p><strong>Recipient:</strong> ${email}</p>
          <p><strong>Prayer Count:</strong> ${prayerCount}</p>
          <p><strong>Request:</strong> ${requestTitle}</p>
        `
        });
      } catch (adminCopyError) {
        Logger.log("Optional admin copy failed: " + adminCopyError.toString());
      }
    }

    return response({
      success: true,
      message: "Email sent successfully."
    });

  } catch (error) {
    Logger.log("Prayer email sending failed: " + error.toString());
    return response({
      success: false,
      error: error.toString()
    });
  }
}

function buildPrayerEmailHtml(requestTitle, requestMessage, prayerCount) {
  return `
    <div style="font-family: Arial, sans-serif; background:#000; padding:40px; color:#f7f2ea;">
      <div style="max-width:640px; margin:auto; background:#0b0b0b; border:1px solid rgba(255,255,255,.12); border-radius:24px; overflow:hidden;">
        <div style="padding:34px; text-align:center; border-bottom:1px solid rgba(255,255,255,.1);">
          <h1 style="margin:0; color:#fff0d2; font-size:30px;">The Prayer Project</h1>
          <p style="margin:8px 0 0; color:#9b9288; letter-spacing:2px; text-transform:uppercase; font-size:12px;">Anonymous Prayer Wall</p>
        </div>

        <div style="padding:34px;">
          <h2 style="margin-top:0; color:#f7f2ea;">Someone prayed for you today.</h2>

          <p style="line-height:1.8; color:#c8beb1;">
            Your request was seen, and someone took a moment to pray for you. You are not forgotten.
          </p>

          <div style="background:#050505; border-left:4px solid #d8c3a5; padding:20px; border-radius:14px; margin:28px 0; color:#f7f2ea;">
            <strong>Prayer Request</strong><br><br>
            ${escapeHtml(requestTitle)}<br><br>
            <span style="color:#c8beb1;">${escapeHtml(requestMessage)}</span>
          </div>

          <p style="color:#c8beb1;">
            Total prayers received: <strong style="color:#fff0d2;">${prayerCount}</strong>
          </p>

          <div style="margin-top:30px; padding:24px; border-radius:18px; background:#050505; text-align:center; border:1px solid rgba(255,255,255,.08);">
            <p style="margin:0; font-style:italic; color:#c8beb1; line-height:1.7;">
              “Cast all your anxiety on Him because He cares for you.”
            </p>
            <p style="margin-top:10px; color:#d8c3a5;">— 1 Peter 5:7</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function response(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function sanitize(text) {
  if (!text) return "";
  return String(text)
    .replace(/[<>]/g, "")
    .trim();
}

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Run this manually as the script owner from the Apps Script editor.
function diagnoseEmailSystem() {
  Logger.log(JSON.stringify({
    adminEmailValid: isValidEmail(ADMIN_EMAIL),
    remainingDailyRecipients: MailApp.getRemainingDailyQuota(),
    message: "If this runs, MailApp authorization is available for this account."
  }));
}

function testEmailSystem() {
  const result = doPost({
    postData: {
      contents: JSON.stringify({
        email: ADMIN_EMAIL,
        requestTitle: "Test Prayer Request",
        requestMessage: "This is a test email from The Prayer Project.",
        prayerCount: 1
      })
    }
  });

  Logger.log(result.getContent());
}
