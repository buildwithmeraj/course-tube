# Course Tube

Course Tube is a Next.js app for discovering, fetching and tracking progress of free YouTube course playlists. Users can add playlists, track watched videos, and organize learning — admins review submissions, manage categories, and publish courses.

## Live Site

Here is the live site: [https://course-tube-seven.vercel.app/](https://course-tube-seven.vercel.app/)

## Key concepts

- Playslists = free YouTube course playlists (fetched via YouTube Data API)
- Progress tracking = mark videos watched and track completion per playlist
- Roles = regular users and admins
- Approval workflow = user-added courses are private to the uploader until an admin approves them and makes them public
- Categories = admin-created containers that group many courses

## Features

- YouTube playlist discovery and metadata fetch
- Track watched videos, resume progress across devices
- User registration and secure password hashing (bcryptjs)
- Role management: admin and user roles
- Admin dashboard for approving courses, managing categories and users
- Course approval workflow: user-added courses remain private until admin approval
- Category management: admins create categories and assign courses
- Search, filters and responsive UI (Next.js App Router + Tailwind/CSS)
- MongoDB-backed storage

## Tech stack

- Next.js (App Router)
- MongoDB
- bcryptjs for password hashing
- YouTube Data API v3
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
MONGODB_URI=your_mongodb_connection_string
YOUTUBE_API_KEY=your_youtube_api_key
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
