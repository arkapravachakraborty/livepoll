# 📊 Poll.io – Real-Time Polling & Analytics Platform

> A full-stack, real-time platform for creating, sharing, and analyzing dynamic polls. Built for rapid feedback collection with absolute data transparency.

## 🚀 Overview

Poll.io empowers creators to launch highly customizable polls in seconds. Whether you need authenticated feedback from a verified team or anonymous public opinions, Poll.io handles it securely. Featuring live WebSockets, creators can watch their analytics update in real-time as votes roll in, and permanently "publish" results to a public archive once voting concludes.

## ✨ Key Features

*   **Dynamic Question Types:** Support for Single Choice (radio), Multiple Choice (checkboxes), and Free Text (short answer) responses.
*   **Real-Time Analytics:** Powered by `Socket.io`, the creator dashboard updates instantly the moment a vote is cast—no page refreshes required.
*   **Strict Access Control:** Creators can toggle between Anonymous voting or Authenticated voting (requiring JWT login).
*   **Lifecycle Management (The "Kill Switch"):** 
    *   **Auto-Expiry:** Set a definitive end date/time for the poll.
    *   **Manual Stop:** Pause response collection instantly from the dashboard.
*   **Results Publishing:** Transform a private data-collection link into a permanent, publicly visible results archive with one click.
*   **Bulletproof Validation:** Frontend and backend checks ensure mandatory questions are answered and closed polls reject late submissions.

## 🛠️ Tech Stack

**Frontend:**
*   Next.js (App Router)
*   React Hook Form (Dynamic field arrays & validation)
*   Tailwind CSS (Styling & responsive design)
*   Lucide React (Icons)
*   Socket.io-client (Real-time events)

**Backend:**
*   Node.js & Express.js
*   Socket.io (WebSocket server)
*   Drizzle ORM (Type-safe database queries)
*   PostgreSQL (Relational database)
*   JSON Web Tokens (JWT Authentication)

---

## 💻 Running the Project Locally

To run this project on your local machine, you will need to start both the backend server and the frontend client.

### Prerequisites
*   Node.js (v18+)
*   PostgreSQL running locally or via a cloud provider (e.g., Supabase, Neon)

### 1. Backend Setup (`/backend`)
Open a terminal and navigate to your backend directory:

```bash
cd backend
npm install
```
Create a .env file in the backend folder and add the following:

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/your_db_name"
JWT_SECRET="your_super_secret_key"
PORT=4000
```

Push Schema to Database:
```bash
"db:studio": "drizzle-kit studio",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
```

Start the Server:
```bash
npm run dev
```

### 2. FrontEnd Setup (`/frontend`)
Open a second terminal and navigate to your frontend directory:
```bash
cd frontend
npm install
```

Environment Variables:
Create a .env.local file in the frontend folder (if needed for any specific Next.js configs, though currently defaulting to localhost:4000).
```bash
npm run dev
```

The app will be running at http://localhost:3000.



### 3. Testing the Flow (For Judges)
1. Create an Account: Navigate to localhost:3000/login to sign up and get your JWT token.

2. Build a Poll: Click "New Poll". Add a mix of text, single-choice, and multiple-choice questions. Try making some mandatory and some optional.

3. Vote: Copy the generated share link. Open an Incognito window to simulate a public user. Submit a vote!

4. Watch the Magic: Keep the Creator Dashboard open on one half of your screen and vote on the other half. Watch the charts and total counts update instantly via WebSockets.

5. Publish Results: Once satisfied, click "Publish Results" on the dashboard. Go back to your Incognito window and refresh the voting link—notice how it is now securely locked and displaying the public results archive.


🤝 Developed By
Arkaprava Chakraborty \
\
Built for ChaiCode Web Dev Cohort Hackathon