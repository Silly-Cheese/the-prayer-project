/*
========================================
THE PRAYER PROJECT
GOOGLE APPS SCRIPT EMAIL SYSTEM
========================================
*/

const ADMIN_EMAIL = "YOUR_EMAIL@gmail.com";

function doPost(e) {

  try {

    const data = JSON.parse(e.postData.contents);

    const email = sanitize(data.email);
    const requestTitle = sanitize(data.requestTitle);
    const requestMessage = sanitize(data.requestMessage);
    const prayerCount = Number(data.prayerCount || 1);

    if (!isValidEmail(email)) {
      return response({
        success: false,
        message: "Invalid email"
      });
    }

    MailApp.sendEmail({
      to: email,
      subject: "Someone Prayed For You ❤️",
      htmlBody: `
        <div style="
          font-family: Arial, sans-serif;
          background: #f8fafc;
          padding: 40px;
          color: #1e293b;
        ">

          <div style="
            max-width: 620px;
            margin: auto;
            background: white;
            border-radius: 18px;
            overflow: hidden;
            box-shadow: 0 12px 30px rgba(0,0,0,.08);
          ">

            <div style="
              padding: 32px;
              background: linear-gradient(135deg, #07111f, #13233f);
              text-align: center;
            ">
              <h1 style="
                margin: 0;
                color: #e7c873;
              ">
                The Prayer Project
              </h1>
            </div>

            <div style="padding: 36px;">

              <h2 style="margin-top: 0;">
                Someone prayed for you today.
              </h2>

              <p style="line-height: 1.8; color: #475569;">
                Your request touched someone's heart, and they took a moment to pray for you.
              </p>

              <div style="
                background: #f8fafc;
                border-left: 4px solid #e7c873;
                padding: 20px;
                border-radius: 12px;
                margin: 28px 0;
              ">
                <strong>Prayer Request</strong><br><br>
                ${requestTitle}<br><br>
                ${requestMessage}
              </div>

              <p style="color: #475569;">
                ❤️ Total prayers received: <strong>${prayerCount}</strong>
              </p>

              <div style="
                margin-top: 30px;
                padding: 24px;
                border-radius: 14px;
                background: #f8fafc;
                text-align: center;
              ">
                <p style="
                  margin: 0;
                  font-style: italic;
                  color: #475569;
                  line-height: 1.7;
                ">
                  “Cast all your anxiety on Him because He cares for you.”
                </p>

                <p style="margin-top: 10px; color: #64748b;">
                  — 1 Peter 5:7
                </p>
              </div>

            </div>

          </div>

        </div>
      `,
      name: "The Prayer Project"
    });

    MailApp.sendEmail({
      to: ADMIN_EMAIL,
      subject: "Prayer Email Sent",
      htmlBody: `
        <h2>Prayer Notification Sent</h2>
        <p><strong>Recipient:</strong> ${email}</p>
        <p><strong>Prayer Count:</strong> ${prayerCount}</p>
      `
    });

    return response({
      success: true
    });

  } catch (error) {

    return response({
      success: false,
      error: error.toString()
    });
  }
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

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
