# The Prayer Project

The Prayer Project is a calm, faith-centered anonymous prayer wall where people can submit prayer requests, pray for others, and send quiet encouragement through email notifications.

## Current Stack

- GitHub Pages for hosting
- Firebase Firestore for prayer request storage
- Firebase Authentication for admin login
- Google Apps Script for email notifications

## Current Features

- Anonymous prayer request submission
- Public prayer wall
- Prayer counters
- Urgent request tags
- Search and category filtering
- Report button for inappropriate requests
- Reported requests are automatically hidden
- Admin dashboard for moderation
- Admin login through Firebase Authentication
- Daily Scripture system
- Homepage announcement system
- Crisis resources page
- Privacy and terms pages
- Custom black/warm visual theme
- Google Apps Script email notification system

## Current Data Flow

### Prayer Request Submission

1. Visitor submits a prayer request.
2. Request is saved to Firestore in `prayer_requests`.
3. Request appears publicly immediately with `status: "approved"`.
4. The requester's email is stored in the document but is not displayed on the public page.

### Prayer Notification

1. Visitor clicks `Pray For This Request`.
2. Website sends the requester's email, request title, request message, and prayer count to Google Apps Script.
3. Apps Script sends the prayer notification email.
4. Firestore prayer count is updated.

### Reporting

1. Visitor reports a prayer request.
2. A report is created in `reports`.
3. The prayer request status changes to `reported`.
4. The request is hidden from the public prayer wall.
5. Admin reviews it in the dashboard.

## Firestore Collections

```plaintext
prayer_requests
reports
settings
admins
```

## Priority List

### Priority 1: Confirm Email Reliability

- Submit a brand-new prayer request with a real email.
- Click `Pray For This Request`.
- Check the browser console for `Prayer Project email response:`.
- Confirm Apps Script returns `success: true`.
- Check inbox and spam.
- Confirm Apps Script execution logs show successful runs.

### Priority 2: Confirm Firestore Rules

- Confirm public users can create prayer requests.
- Confirm public users can increase prayer counts.
- Confirm public users can report requests.
- Confirm reported requests disappear from the public wall.
- Confirm signed-in admins can read all requests and reports.

### Priority 3: Confirm Admin Dashboard Settings

- Confirm daily Scripture saves correctly.
- Confirm daily Scripture reference saves correctly.
- Confirm homepage announcement saves correctly.
- Confirm settings display publicly on the homepage.

### Priority 4: Custom Domain Launch

- Update the `CNAME` file with the real domain.
- Configure DNS A records for GitHub Pages.
- Configure the `www` CNAME record.
- Add the custom domain in GitHub Pages settings.
- Enforce HTTPS after GitHub verifies the domain.
- Add the custom domain to Firebase Authentication authorized domains.

### Priority 5: Branding Polish

- Add a favicon.
- Add a simple logo mark.
- Add Open Graph/social preview tags.
- Add a `site.webmanifest` file.
- Add theme-color metadata for mobile browsers.

### Priority 6: Final Content Review

- Review About page wording.
- Review Privacy Policy wording.
- Review Terms of Service wording.
- Review Crisis Resources page.
- Confirm the site clearly says it is not an emergency service.

## Recommended Favicon Direction

The best favicon/logo concept is a minimal cream-gold symbol on black:

- A small four-point star/candle flame
- A soft circular outline
- No detailed text inside the favicon
- Warm cream/gold on black

Suggested concept:

```plaintext
Black circle
Thin warm-gold ring
Small cream four-point star or candle flame in the center
```

This matches the current theme and feels calm, prayerful, and recognizable at small sizes.

## Purpose

The Prayer Project exists to encourage, comfort, and remind people that they are not forgotten.
