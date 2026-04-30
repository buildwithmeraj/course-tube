# <img src="public/icon.svg" alt="DRPY Icon" width="36" height="36" style="vertical-align: middle; margin-top: 4px;" /> Course Tube

Course Tube is a Next.js app for discovering, syncing, and tracking free YouTube course playlists. Users can add playlists, track watched videos, and organize their learning, while admins review submissions, manage categories, and publish approved courses.

## Live Site

Here is the live site: [https://course-tube-seven.vercel.app/](https://course-tube-seven.vercel.app/)

## Key concepts

- Playlists = free YouTube course playlists fetched via the YouTube Data API
- Progress tracking = mark videos watched and track completion per playlist
- Roles = regular users and admins
- Approval workflow = user-added courses are private to the uploader until an admin approves them and makes them public
- Categories = admin-created containers that group related courses

## How it works

1. A user submits a YouTube playlist as a course.
2. Course metadata and videos are fetched from YouTube.
3. The uploader tracks progress privately.
4. An admin reviews the submission and approves or rejects it.
5. Approved courses become public and appear in categories and search.

## Features

- YouTube playlist discovery and metadata fetch
- Course synchronization that pulls the latest playlist videos on demand
- Track watched videos and resume progress across devices
- Enrollment flow per course
- User registration/login (credentials) and Google OAuth (NextAuth)
- Secure password hashing (bcryptjs)
- Profile dashboard with progress stats
- Role management: admin and user roles
- Admin dashboard for approving/rejecting courses, managing categories and users
- Course approval workflow: user-added courses remain private until admin approval
- Category management: admins create categories and assign courses
- Search, filters, and sorting (enroll count, total videos, created/updated)
- Featured categories and popular courses sections on the homepage
- Contact form (email delivered via Nodemailer)
- Profile photo upload (imgbb)
- Theme toggle (dark/light)
- Responsive UI (Next.js App Router + Tailwind/CSS)
- MongoDB-backed storage

## Tech stack

- Next.js (App Router)
- MongoDB
- bcryptjs for password hashing
- NextAuth (Credentials + Google)
- YouTube Data API v3
- Nodemailer (contact form)
- TailwindCSS / plain CSS

## Getting started

Prerequisites

- Node.js 16+
- MongoDB (local or cloud)
- YouTube Data API key

Installation

1. Clone

```bash
git clone <repo-url>
cd course-tube
```

2. Install

```bash
npm install
# or yarn install
# or pnpm install
```

3. Environment
   Create `.env.local`:

```
SITE_NAME=Course Tube
NEXT_PUBLIC_SITE_NAME=Course Tube
PAGE_TITLE=Course Tube
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret

GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

NEXT_PUBLIC_YOUTUBE_API=your_public_youtube_api_key
YOUTUBE_API_KEY=your_server_side_youtube_api_key
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_key

EMAIL_SERVICE=gmail
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_app_password

ADMIN_EMAIL=admin@example.com
# Optional
PORT=3000
```

4. Run

```bash
npm run dev
# or yarn dev
# or pnpm dev
```

Open http://localhost:3000

## Usage / Workflow

- Register as a user and add a YouTube playlist (course).
- New courses are visible only to the uploader.
- Admin reviews submissions in the admin dashboard and can:
  - Approve to make a course public
  - Reject or request changes
  - Create and manage categories
- Public courses appear under categories and are discoverable by others.

## YouTube API keys

This app uses separate keys for client-side and server-side YouTube requests:

- `NEXT_PUBLIC_YOUTUBE_API` is used by browser-side playlist and video fetches.
- `YOUTUBE_API_KEY` is used by the server-side course synchronization route.

If sync fails with a referer or access error, check that the server key is valid and allowed for server requests.

## Project structure (important parts)

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── register/
│   ├── dashboard/         # admin dashboard routes
│   ├── courses/           # course pages and CRUD
│   └── page.js
└── lib/
    └── db.js
```

## Contributing

Open issues or PRs. Add tests and follow repo conventions.

## License

MIT
