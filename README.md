<p align="center">
  <h1 align="center">DevConnect - Developer Networking Frontend</h1>
  <p align="center">A React 18 + Vite single-page app for discovering developers, matching, secure real-time chat, calls, AI-assisted profiles, projects, subscriptions, and account safety.</p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Redux_Toolkit-2.3-764ABC?style=for-the-badge&logo=redux&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.io-4.8-010101?style=for-the-badge&logo=socket.io&logoColor=white" />
  <img src="https://img.shields.io/badge/DaisyUI-4.12-5A0EF8?style=for-the-badge" />
</p>

---

## Table of Contents

- [Overview](#overview)
- [Feature Set](#feature-set)
  - [Authentication](#1-authentication)
  - [Dashboard Shell](#2-dashboard-shell)
  - [Developer Discovery](#3-developer-discovery)
  - [Profile Management](#4-profile-management)
  - [Connections & Requests](#5-connections--requests)
  - [Real-Time Chat](#6-real-time-chat)
  - [Voice & Video Calls](#7-voice--video-calls)
  - [AI Tools](#8-ai-tools)
  - [Projects](#9-projects)
  - [Premium Plans](#10-premium-plans)
  - [Notifications](#11-notifications)
  - [Bookmarks, Invites & Profile Views](#12-bookmarks-invites--profile-views)
  - [Security, Privacy & Admin](#13-security-privacy--admin)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Architecture Decisions](#architecture-decisions)

---

## Overview

DevConnect Frontend is the browser client for a developer networking platform. It gives users a swipeable discovery feed, connection requests, end-to-end-encryption-aware chat, WebRTC call controls, AI helpers, project collaboration, paid memberships, account security, and admin screens.

The app uses React Router for route-level pages, Redux Toolkit for shared state, Axios for API calls, Socket.io Client for realtime events, Tailwind CSS/DaisyUI for styling, and Framer Motion for transitions.

---

## Feature Set

### 1. Authentication

Multi-screen onboarding and account recovery:

| Route | Screen |
|---|---|
| `/` | Landing and public home |
| `/login` | Email/password login |
| `/register` | Registration entry |
| `/verify-otp` | OTP verification |
| `/complete-signup` | Profile completion after OTP |
| `/forgot-password` | Password reset flow |

The Axios client sends credentials with every request and retries protected calls through `/refresh-token` when the backend returns `401`.

---

### 2. Dashboard Shell

Authenticated routes are wrapped by `src/layouts/Body.jsx`:

- Fixed navbar
- Responsive sidebar
- Mobile navigation button
- Footer inside dashboard pages
- User profile hydration through `/profile/view`
- App-wide Socket.io connection while signed in
- Real-time notification and message delivery support

---

### 3. Developer Discovery

The feed at `/feed` is the core matching surface:

- Swipeable profile cards with like/skip gestures
- Search by name or skills with debounced requests
- Virtualized search result grid for large result sets
- Location-aware discovery within a 50 km radius when browser geolocation is available
- Profile cards with photos, role, experience, availability, distance, skills, endorsements, and match score
- Bookmark, block, report, like, and skip actions from the card
- AI-powered match explanation from each profile card

---

### 4. Profile Management

The profile page at `/profile` includes:

- Profile strength meter
- Edit profile form
- Photo updates
- Role, experience, availability, about, and skills management
- Social links and GitHub profile fields
- AI bio generation and skill suggestions
- Premium theme selection when plan limits allow it

---

### 5. Connections & Requests

The app separates discovery from relationship management:

- `/connections` lists accepted developer connections
- `/requests` lists incoming connection requests
- Profile cards handle pending, connected, and received-request states
- Matches trigger a real-time celebration overlay
- Connected users can endorse each other's skills

---

### 6. Real-Time Chat

Chat screens include `/messages` for conversation discovery and `/chat/:targetUserId` for a thread:

- Socket.io live message delivery
- Message acknowledgements, delivery receipts, and seen receipts
- Typing indicators
- Unread counts
- Message deletion
- Pinned messages
- Emoji reactions
- Markdown rendering
- GIF picker through Tenor when `VITE_TENOR_API_KEY` is set
- Voice-note recording and playback
- File/image upload with client-side image compression
- Offline cache and queued outgoing messages through IndexedDB helpers
- Public-key based encryption helpers so private keys stay on the client

---

### 7. Voice & Video Calls

Call UI is integrated into chat:

- Voice and video call buttons
- Incoming-call sheet
- Outgoing-call sheet
- In-call screen
- Mute, camera, and hang-up controls
- Missed-call cards in chat
- Call quality badge
- STUN/TURN credentials loaded from the backend with client fallback servers
- Socket events for invite, accept, decline, busy, unavailable, end, missed, offer, answer, and ICE candidates

---

### 8. AI Tools

AI features are surfaced where they help the workflow:

| Area | AI Capability |
|---|---|
| Profile | Generate bio and suggest skills |
| Discovery | Explain match compatibility |
| Chat | Generate icebreakers and collaboration prompts |
| Projects | Generate project descriptions, tech stacks, and roadmaps |
| GitHub | Trigger sync/summarization through backend endpoints |

AI availability is checked against the current membership plan and shows upgrade prompts when blocked.

---

### 9. Projects

The project workspace at `/projects` supports:

- My Projects and Explore tabs
- Create projects with title, description, and tech stack
- AI "Magic" project detail suggestions
- Edit and delete project cards when permitted
- Join requests for open projects
- Accept/reject join requests
- Member listing and member removal for project managers
- Project chat modal with paginated older messages
- AI project roadmap modal

---

### 10. Premium Plans

The premium screen at `/premium` loads plan data from the backend:

- Free, Silver, Gold, or admin-created plans
- Active membership display
- Plan feature lists
- Razorpay checkout script loaded only when payment starts
- Payment order creation through backend APIs
- Premium verification after checkout succeeds

---

### 11. Notifications

The notification bell in the navbar provides:

- Real-time `notification:new` updates
- Recent notification dropdown
- Unread count badge
- Mark one notification as read
- Mark all as read
- Delete notification support through API modules

---

### 12. Bookmarks, Invites & Profile Views

Additional user-facing screens:

- `/bookmarks` for saved developer profiles
- `/invite-friends` for email invites, invite history, and invite stats
- Profile-view tracking from cards
- Profile views shown to eligible plans
- Privacy controls for anonymized browsing

---

### 13. Security, Privacy & Admin

The settings page at `/settings` includes:

- Two-factor authentication setup with QR code
- TOTP enable/disable confirmation
- Active session list
- Revoke other sessions
- Privacy switch for hidden profile views

The admin area at `/admin` is restricted to admin users:

- Users
- Reports
- Banned users
- Membership plans

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build Tool | Vite 6 |
| Routing | React Router DOM 6 |
| State Management | Redux Toolkit + React Redux |
| HTTP Client | Axios with credentials and refresh retry |
| Real-Time | Socket.io Client 4 |
| Styling | Tailwind CSS 3, DaisyUI, custom CSS utilities |
| Animation | Framer Motion |
| Icons | React Icons |
| Virtualization | React Virtuoso |
| Payments | Razorpay Checkout script |
| QR Codes | qrcode |
| Effects | canvas-confetti |
| Linting | ESLint 9 |

---

## Project Structure

```text
devConnect-Frontend-main/
├── README.md
├── index.html                                  # HTML5 SPA entry
├── package.json                                # Dependencies & build scripts
├── package-lock.json
├── vite.config.js                              # Vite bundler configuration & proxies
├── tailwind.config.js                          # Tailwind CSS styling & DaisyUI plugins
├── postcss.config.js                           # PostCSS autoprefixer configuration
├── eslint.config.js                            # ESLint 9 linting rules
├── vercel.json                                 # Vercel SPA routing rewrites
├── public/
│   ├── logo.svg                                # Application brand icon
│   └── robots.txt                              # Web crawler instructions
└── src/
    ├── main.jsx                                # Entrypoint: mounts App, loads global styles
    ├── App.jsx                                 # Providers, router & lazy-loaded routes
    ├── api/                                    # Axios HTTP services by domain
    │   ├── client.js                           # Axios instance with credentials & refresh interceptor
    │   ├── index.js                            # Aggregate API export
    │   ├── admin.js                            # Admin user/report/plan APIs
    │   ├── ai.js                               # AI bios, icebreakers & project helpers
    │   ├── auth.js                             # Authentication, OTP & session APIs
    │   ├── bookmarks.js                        # Bookmark APIs
    │   ├── chat.js                             # Messaging & conversation APIs
    │   ├── community.js                        # Community & endorsement APIs
    │   ├── connections.js                      # Connection, block, report APIs
    │   ├── enhancementApi.js                   # Chat extras: voice notes, search, prefs, missed calls
    │   ├── feed.js                             # Discovery feed & radius search
    │   ├── invite.js                           # Email invitation APIs
    │   ├── notifications.js                    # Notification APIs
    │   ├── plans.js                            # Membership & Razorpay order APIs
    │   ├── profile.js                          # Profile APIs
    │   ├── profileViews.js                     # Profile view tracking APIs
    │   ├── projects.js                         # Projects & team APIs
    │   └── requests.js                         # Connection request APIs
    ├── components/                             # Shared, app-agnostic components
    │   ├── common/
    │   │   ├── ErrorBoundary.jsx               # Component failure barrier
    │   │   └── MatchCelebration.jsx            # Global confetti match overlay
    │   ├── layout/
    │   │   ├── Navbar.jsx                      # Top navigation bar
    │   │   ├── Sidebar.jsx                     # Side navigation with counters
    │   │   ├── Footer.jsx                      # Global footer
    │   │   └── NotificationBell.jsx            # Notification bell & dropdown
    │   └── ui/                                 # Atomic UI primitives
    │       ├── Aurora.jsx
    │       ├── AuthButton.jsx
    │       ├── AuthInput.jsx
    │       ├── AuthShell.jsx
    │       ├── Button.jsx
    │       ├── Card.jsx
    │       ├── EmptyState.jsx
    │       ├── Modal.jsx
    │       ├── Select.jsx
    │       └── Spinner.jsx
    ├── config/
    │   ├── constants.js                        # BASE_URL & Socket.io connection helpers
    │   └── features.js                         # Client feature switches
    ├── context/
    │   ├── ThemeProvider.jsx                   # Dark/light theme provider
    │   └── ToastProvider.jsx                   # Global toast provider
    ├── features/                               # Domain-specific building blocks
    │   ├── ai/
    │   │   ├── AIMatchExplainer.jsx            # AI compatibility explanation dialog
    │   │   └── AIPanel.jsx                     # AI bio & skill assistant
    │   ├── call/
    │   │   ├── callTone.js                     # Ringtone & dial tone synthesis
    │   │   └── components/                     # WebRTC call UI
    │   │       ├── CallButton.jsx
    │   │       ├── CallControls.jsx
    │   │       ├── CallOverlays.jsx
    │   │       ├── CallProvider.jsx
    │   │       ├── InCallScreen.jsx
    │   │       ├── IncomingCallSheet.jsx
    │   │       └── OutgoingCallSheet.jsx
    │   ├── chat/                               # Chat extras (markdown, voice, reactions, GIFs...)
    │   │   ├── index.js
    │   │   ├── CallQualityBadge.jsx
    │   │   ├── ChatSearchBar.jsx
    │   │   ├── GifPicker.jsx
    │   │   ├── MarkdownMessage.jsx
    │   │   ├── MessageReactions.jsx
    │   │   ├── MissedCallCard.jsx
    │   │   ├── VoiceNotePlayer.jsx
    │   │   └── VoiceNoteRecorder.jsx
    │   ├── connections/
    │   │   └── ConnectionModal.jsx             # Connection details & endorsements
    │   ├── feed/
    │   │   ├── UserCard.jsx                    # Swipeable profile card with actions
    │   │   └── CompactUserItem.jsx             # Compact card for search results
    │   ├── offline/
    │   │   ├── index.js
    │   │   └── offlineChat.js                  # Chat cache & pending send queue
    │   └── profile/
    │       ├── EditProfile.jsx                 # Profile editor form
    │       ├── ProfileStrengthMeter.jsx        # Profile completeness meter
    │       └── ProfileViews.jsx                # Who viewed your profile
    ├── hooks/
    │   ├── useCall.js                          # WebRTC call state hook
    │   └── useConnectionList.js                # Connections fetcher hook
    ├── layouts/                                # Route layout shells (render <Outlet />)
    │   ├── Body.jsx                            # Authenticated dashboard shell
    │   └── LandingPage.jsx                     # Public/auth shell
    ├── pages/                                  # Route-level screens
    │   ├── Home.jsx
    │   ├── Feed.jsx
    │   ├── Profile.jsx
    │   ├── Connections.jsx
    │   ├── Requests.jsx
    │   ├── Messages.jsx
    │   ├── ChatBox.jsx
    │   ├── Projects.jsx
    │   ├── Bookmarks.jsx
    │   ├── InviteFriends.jsx
    │   ├── Premium.jsx
    │   ├── Settings.jsx
    │   ├── auth/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Otp.jsx
    │   │   └── ForgotPassword.jsx
    │   └── admin/
    │       ├── AdminLayout.jsx
    │       ├── AdminUsers.jsx
    │       ├── AdminReports.jsx
    │       ├── AdminBanned.jsx
    │       └── AdminPlans.jsx
    ├── store/
    │   ├── appStore.js                         # configureStore root
    │   └── slices/
    │       ├── userSlice.js
    │       ├── feedSlice.js
    │       ├── connectionSlice.js
    │       ├── requestsSlice.js
    │       ├── callSlice.js
    │       ├── projectSlice.js
    │       ├── plansSlice.js
    │       └── profileViewSlice.js
    ├── styles/
    │   ├── index.css                           # Tailwind base, components, animations
    │   └── utilities.css                       # Custom utilities
    └── utils/
        ├── aiApi.js                            # AI request wrapper
        ├── avatar.js                           # Avatar/photo URL helpers
        ├── callClient.js                       # RTCPeerConnection wrapper
        ├── e2ee.js                             # Encryption primitives
        ├── textUtils.jsx                       # Linkify & highlight helpers
        └── timeUtils.js                        # Time formatters
```

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend server running locally at `http://localhost:3000` or deployed at the configured production API URL

### Install Dependencies

```bash
cd DevConnect-FrontEnd
npm install
```

### Configure Environment

The API base URL is currently selected in `src/config/constants.js`:

```js
location.hostname === "localhost"
  ? "http://localhost:3000"
  : "YOUR_BACKEND_URL"
```

For GIF search, create `.env` with:

```bash
VITE_TENOR_API_KEY=your_tenor_api_key
```

### Start Development Server

```bash
npm run dev
```

The app is available at `http://localhost:5173`.

---

## Environment Variables

| Variable | Example | Description |
|---|---|---|
| `VITE_TENOR_API_KEY` | `AIza...` | Enables the Tenor GIF picker in chat. Without it, the GIF button is hidden. |

API and Socket.io URLs are hardcoded in `src/config/constants.js`.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build production assets |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

From the project root, `npm run dev:frontend` starts this frontend and `npm run dev` starts frontend and backend together.

---

## Architecture Decisions

**Route-level code splitting** - dashboard pages are lazy-loaded from `App.jsx`, keeping the initial public/auth bundle lighter.

**Global state only where needed** - user, feed, connections, requests, plans, projects, calls, and profile views live in Redux slices; local UI state stays in components.

**Single realtime connection** - `Body.jsx` opens one app-wide Socket.io connection for the signed-in user, while chat and call features register their own event handlers.

**Plan-aware UI** - AI tools, chat, calls, profile views, project creation, and themes surface upgrade prompts when backend plan limits block access.

**Feature flags for chat extras** - markdown, voice notes, reactions, GIFs, search, preferences, call quality, missed calls, and offline chat can be toggled from `src/config/features.js`.

**Client privacy model** - encryption helpers generate and use client-held private keys, with only public keys saved through the backend API.
