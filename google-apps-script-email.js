/*
========================================
THE PRAYER PROJECT
GOOGLE APPS SCRIPT EMAIL SYSTEM
========================================

IMPORTANT SETUP:
1. Create a Google Sheet.
2. Put the Sheet ID below.
3. Create a sheet tab named PrayerContacts.
4. The website will send contact records to this script when a request is submitted.
5. When someone prays, the website sends requestId to this script.
6. This script looks up the email and sends the notification.

This avoids exposing emails publicly in Firestore reads.
*/

const ADMIN_EMAIL = "YOUR_EMAIL@gmail.com";
const CONTACT_SHEET_ID = "PASTE_YOUR_GOOGLE_SHEET_ID_HERE";
const CONTACT_SHEET_NAME = "PrayerContacts";

function doGet() {
  return response({ success: true, message: "The Prayer Project email service is running." });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return response({ success: false, message: "No request body received." });
    }

    const data = JSON.parse(e.postData.contents);
    const action = sanitize(data.action || "sendPrayerEmail");

    if (action === "saveContact") {
      return saveContact(data);
    }

    return sendPrayerEmail(data);

  } catch (error) {
    return response({ success: false, error: error.toString() });
  }
}

function saveContact(data) {
  const requestId = sanitize(data.requestId);
  const email = sanitize(data.email);

  if (!requestId) return response({ success: false, message: "Missing requestId." });
  if (!isValidEmail(email)) return response({ success: false, message: "Invalid email." });

  const sheet = getContactSheet();
  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === requestId) {
      sheet.getRange(i + 1, 2).setValue(email);
      sheet.getRange(i + 1, 3).setValue(new Date());
      return response({ success: true, message: "Contact updated." });
    }
  }

  sheet.appendRow([requestId, email, new Date()]);
  return response({ success: true, message: "Contact saved." });
}

function sendPrayerEmail(data) {
  const requestId = sanitize(data.requestId);
  const requestTitle = sanitize(data.requestTitle || "Prayer Request");
  const requestMessage = sanitize(data.requestMessage || "");
  const prayerCount = Number(data.prayerCount || 1);

  let email = sanitize(data.email || "");

  if (!email && requestId) {
    email = findEmailByRequestId(requestId);
  }

  if (!isValidEmail(email)) {
    return response({ success: false, message: "No valid email found for this request." });
  }

  MailApp.sendEmail({
    to: email,
    subject: "Someone Prayed For You",
    htmlBody: buildPrayerEmailHtml(requestTitle, requestMessage, prayerCount),
    name: "The Prayer Project"
  });

  if (isValidEmail(ADMIN_EMAIL)) {
    MailApp.sendEmail({
      to: ADMIN_EMAIL,
      subject: "Prayer Notification Sent",
      htmlBody: `
        <h2>Prayer Notification Sent</h2>
        <p><strong>Recipient:</strong> ${email}</p>
        <p><strong>Request ID:</strong> ${requestId}</p>
        <p><strong>Prayer Count:</strong> ${prayerCount}</p>
        <p><strong>Request:</strong> ${requestTitle}</p>
      `
    });
  }

  return response({ success: true, message: "Email sent." });
}

function findEmailByRequestId(requestId) {
  const sheet = getContactSheet();
  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(requestId)) {
      return sanitize(values[i][1]);
    }
  }

  return "";
}

function getContactSheet() {
  const spreadsheet = SpreadsheetApp.openById(CONTACT_SHEET_ID);
  let sheet = spreadsheet.getSheetByName(CONTACT_SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(CONTACT_SHEET_NAME);
  }

  const firstRow = sheet.getRange(1, 1, 1, 3).getValues()[0];
  if (firstRow[0] !== "Request ID" || firstRow[1] !== "Email" || firstRow[2] !== "Updated At") {
    sheet.getRange(1, 1, 1, 3).setValues([["Request ID", "Email", "Updated At"]]);
  }

  return sheet;
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
          <p style="line-height:1.8; color:#c8beb1;">Your request was seen, and someone took a moment to pray for you. You are not forgotten.</p>
          <div style="background:#050505; border-left:4px solid #d8c3a5; padding:20px; border-radius:14px; margin:28px 0; color:#f7f2ea;">
            <strong>Prayer Request</strong><br><br>
            ${requestTitle}<br><br>
            <span style="color:#c8beb1;">${requestMessage}</span>
          </div>
          <p style="color:#c8beb1;">Total prayers received: <strong style="color:#fff0d2;">${prayerCount}</strong></p>
          <div style="margin-top:30px; padding:24px; border-radius:18px; background:#050505; text-align:center; border:1px solid rgba(255,255,255,.08);">
            <p style="margin:0; font-style:italic; color:#c8beb1; line-height:1.7;">“Cast all your anxiety on Him because He cares for you.”</p>
            <p style="margin-top:10px; color:#d8c3a5;">— 1 Peter 5:7</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function response(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function sanitize(text) {
  if (!text) return "";
  return String(text).replace(/[<>]/g, "").trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function testEmailSystem() {
  const result = doPost({
    postData: {
      contents: JSON.stringify({
        action: "sendPrayerEmail",
        email: ADMIN_EMAIL,
        requestTitle: "Test Prayer Request",
        requestMessage: "This is a test email from The Prayer Project.",
        prayerCount: 1
      })
    }
  });

  Logger.log(result.getContent());
}