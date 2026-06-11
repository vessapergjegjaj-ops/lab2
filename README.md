# Stadium Ticket Booking System

Full-stack university project with React + Vite frontend, Node/Express backend, MySQL, MongoDB connection support, JWT authentication, and Socket.IO live updates.

## Completed Features

- Login/register with JWT access and refresh tokens
- Protected user pages and admin-only pages
- Match listing and match details from MySQL
- Live stadium seat selection with Socket.IO
- Transaction-safe booking creation using the authenticated user
- Server-side ticket total calculation
- Ticket, payment, seat reservation, booking, and notification records
- Simulated payments without storing card number or CVV
- User notifications with read/unread status
- Admin dashboard with real totals, recent bookings, recent payments, revenue, and occupancy
- Advanced admin search for matches, teams, bookings, users, tickets, payments, and stadiums
- Dynamic admin reports
- CSV, JSON, and Excel-style export
- JSON/CSV import for bookings, users, tickets, matches, and payments

## Folder Structure

```text
.
├── src/                 # Express backend
├── frontend/            # React + Vite frontend
├── src/database/        # MySQL schema
├── postman/             # API collection
└── README.md
```

## 1. Backend Setup

```bash
cd lab2-backend-socket.io
npm install
copy .env.example .env
npm run dev
```

Edit `.env` before running:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=stadium_ticket_booking
MONGODB_URI=mongodb://127.0.0.1:27017/stadium_ticket_booking
ACCESS_TOKEN_SECRET=change-this-access-secret
REFRESH_TOKEN_SECRET=change-this-refresh-secret
```

The backend runs on `http://localhost:3000` by default.

## 2. MySQL Import

Create a database named:

```text
stadium_ticket_booking
```

Import this file in phpMyAdmin or Laragon:

```text
src/database/mysql.schema.sql
```

Demo accounts after import:

```text
Admin:   admin@example.com / Admin123!
Student: student@example.com / User123!
```

## 3. Frontend Setup

```bash
cd lab2-backend-socket.io/frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

Optional frontend environment:

```bash
copy .env.example .env
```

```env
VITE_API_BASE_URL=http://localhost:3000/api/mysql
```

## 4. Build Commands

Backend:

```bash
npm run dev
npm start
```

Frontend:

```bash
cd frontend
npm run dev
npm run build
```

## 5. How To Test

1. Login as `student@example.com`.
2. Open Matches, choose a match, select seats, and confirm a booking.
3. Complete the simulated payment form.
4. Check Dashboard and Notifications.
5. Open another browser/user and verify booked seats cannot be selected again.
6. Login as `admin@example.com`.
7. Check Admin Dashboard, Search, Reports, and Export/Import pages.

## Notes

- Do not commit `.env`; use `.env.example` for configuration.
- `node_modules` and `frontend/dist` are generated and should not be submitted.
- MongoDB is optional for the main MySQL booking flow. If MongoDB is not running, the backend logs a warning and continues.
