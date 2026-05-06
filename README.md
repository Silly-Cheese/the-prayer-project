# The Prayer Project

The Prayer Project is a warm, peaceful, anonymous prayer wall where people can submit prayer requests and others can click **Pray For This Request** to let the requester know they were prayed for.

This project uses:

- GitHub Pages for hosting
- Firebase Firestore for prayer request storage
- Google Apps Script for sending email notifications

## Current Features

- Anonymous prayer request submission
- Live prayer wall
- Prayer counters
- Urgent request tags
- Search and category filtering
- Private email notification system through Google Apps Script
- Responsive, mobile-friendly design
- Warm, calm, faith-centered styling

## Files

```plaintext
index.html
app.js
README.md
firestore.rules
google-apps-script-email.js
```

## Firebase Setup

Create a Firebase project and enable Firestore Database.

The website currently writes prayer requests into this collection:

```plaintext
prayer_requests
```

Each request looks like this:

```json
{
  "title": "Please pray for my family",
  "category": "Family",
  "message": "We are going through a hard time.",
  "email": "private@example.com",
  "urgent": false,
  "prayerCount": 0,
  "createdAt": "server timestamp"
}
```

## Important Privacy Note

The current simple version stores the requester's email in Firestore. This works for early testing, but the better long-term version should hide emails from public reads by either:

1. Separating public prayer data from private email data, or
2. Using stronger Firestore security rules, or
3. Routing submissions through a backend.

## GitHub Pages Setup

Go to:

```plaintext
Repository Settings → Pages
```

Use:

```plaintext
Source: Deploy from branch
Branch: main
Folder: /root
```

Your website should become available at:

```plaintext
https://silly-cheese.github.io/the-prayer-project/
```

## Google Apps Script Setup

1. Go to https://script.google.com
2. Create a new project
3. Copy the contents of `google-apps-script-email.js`
4. Replace `ADMIN_EMAIL` with your email
5. Deploy as a Web App
6. Set Execute As to `Me`
7. Set access to `Anyone`
8. Copy the Web App URL into `app.js`

## Recommended Next Features

- Admin moderation dashboard
- Request approval before public display
- Report prayer request button
- Email privacy separation
- Prayer encouragement messages
- Daily verse banner
- Admin-only statistics page
- CAPTCHA or spam protection

## Purpose

The Prayer Project exists to encourage, comfort, and remind people that they are not forgotten.
