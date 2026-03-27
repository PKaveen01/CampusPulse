# Smart Campus Operations Hub

A comprehensive web platform unifying facility management, asset booking, and maintenance operations for a modern university campus.

---

## Team Modules

| Member | Module |
|--------|--------|
| **Member 1** | Facilities & Assets Catalogue |
| **Member 2** | Booking Management & Conflict Resolution |
| **Member 3** | Maintenance & Incident Ticketing |
| **Member 4** | Authentication, Authorization & Notifications ✅ |

---

## Tech Stack

- **Backend**: Spring Boot 3.2, Spring Security, OAuth2, WebSocket, JPA
- **Frontend**: React 18, Vite, React Router v6
- **Database**: MySQL 8
- **Auth**: JWT + Google OAuth2

---

## Quick Start

### 1. Database
```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend
```bash
cd backend
# Edit src/main/resources/application.properties:
#   - DB credentials
#   - Google OAuth2 client ID & secret
#   - JWT secret
mvn spring-boot:run
# Runs on http://localhost:8080
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## Environment – application.properties (key settings)

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/smart_campus_hub
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD

app.jwt.secret=YOUR_LONG_SECRET_KEY
spring.security.oauth2.client.registration.google.client-id=YOUR_GOOGLE_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_GOOGLE_CLIENT_SECRET

app.frontend-url=http://localhost:5173
```

---

## Google OAuth2 Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → APIs & Services → Credentials → OAuth 2.0 Client ID
3. Authorised redirect URI: `http://localhost:8080/oauth2/callback/google`
4. Authorised redirect URI: `http://localhost:8080/login/oauth2/code/google`
5. Paste Client ID and Secret into `application.properties`

---

## Default Admin Account

After running `schema.sql`:
- **Email**: `admin@smartcampus.edu`
- **Password**: `Admin@123` *(change this immediately)*

---

## Folder Structure

```
smart-campus-hub/
├── backend/                          # Spring Boot
│   └── src/main/java/com/smartcampus/
│       ├── config/                   # Security, WebSocket configs (Member 4)
│       ├── common/                   # Shared DTOs, exceptions
│       └── modules/
│           ├── auth/                 # ✅ Member 4 — fully implemented
│           │   ├── controller/       # AuthController, NotificationController
│           │   ├── service/          # UserService, NotificationService, JwtTokenProvider
│           │   ├── security/         # Filters, OAuth2, UserDetails
│           │   ├── entity/           # User, Notification, RefreshToken, ...
│           │   └── repository/
│           ├── resource/             # 🚧 Member 1 — stub only
│           ├── booking/              # 🚧 Member 2 — stub only
│           └── ticket/               # 🚧 Member 3 — stub only
│
├── frontend/                         # React + Vite
│   └── src/
│       ├── context/                  # AuthContext, NotificationContext
│       ├── services/                 # api.js, authService.js
│       ├── components/
│       │   ├── common/               # ProtectedRoute, NotificationBell, StatCard
│       │   └── layout/               # Navbar
│       └── pages/
│           ├── Auth/                 # ✅ Login, Signup, OAuth2Redirect
│           ├── Dashboards/           # ✅ User, Admin, Technician, Manager
│           ├── Resources/            # 🚧 Member 1
│           ├── Bookings/             # 🚧 Member 2
│           └── Tickets/              # 🚧 Member 3
│
├── database/schema.sql               # Full DB schema for all 4 modules
└── .github/workflows/ci.yml
```

---

## API Endpoints (Member 4)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | Public | Register with email/password |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| POST | `/api/auth/logout` | JWT | Invalidate refresh token |
| POST | `/api/auth/refresh-token` | Public | Get new access token |
| GET  | `/api/auth/me` | JWT | Get current user |
| GET  | `/api/notifications` | JWT | List notifications |
| GET  | `/api/notifications/unread-count` | JWT | Badge count |
| PUT  | `/api/notifications/{id}/read` | JWT | Mark one as read |
| PUT  | `/api/notifications/read-all` | JWT | Mark all as read |
| GET  | `/api/admin/users` | ADMIN | List all users |
| PUT  | `/api/admin/users/{id}/role` | ADMIN | Change user role |

OAuth2: `GET /oauth2/authorization/google` → redirects to Google

WebSocket: `ws://localhost:8080/ws` — subscribe to `/user/{id}/queue/notifications`

---

## User Roles & Dashboards

| Role | Dashboard | Access |
|------|-----------|--------|
| USER | `/dashboard/user` | Bookings, tickets, resources (read) |
| TECHNICIAN | `/dashboard/technician` | Assigned tickets |
| MANAGER | `/dashboard/manager` | Resources overview, booking approvals |
| ADMIN | `/dashboard/admin` | Full access, user management |
