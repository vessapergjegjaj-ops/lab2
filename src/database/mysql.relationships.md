# MySQL Schema Expansion Map

This project currently uses MySQL repositories for the existing core tables:

- `users`
- `bookings`
- `events`
- `tickets`
- `stadiums`
- `seat_categories`

The schema in `mysql.schema.sql` preserves those names and columns used by the existing repositories, then adds system and football-ticketing expansion tables. The full schema contains 25 relational tables.

## System Expansion

- `roles` stores RBAC role definitions.
- `permissions` stores permission definitions by `resource` and `action`.
- `user_roles` connects `users` to `roles`.
- `role_permissions` connects `roles` to `permissions`.
- `refresh_tokens` connects active/rotated JWT refresh tokens to `users`.
- `audit_logs` records critical actions by `users` and stores old/new JSON snapshots.
- `notifications` tracks per-user in-app/email/SMS/push notifications.
- `settings` stores configurable system values, optionally updated by a `users` row.
- `files` stores uploaded file metadata and optionally points to the uploading `users` row.

## Stadium Domain Expansion

- `leagues` groups football competitions and seasons.
- `teams` belongs optionally to `leagues` and may reference a logo in `files`.
- `matches` connects an existing `events` row to football-specific data: `leagues`, `stadiums`, home team, away team, kickoff time, and sale status.
- `seats` expands `seat_categories` into physical seats inside `stadiums`.
- `seat_reservations` connects `matches`, `seats`, `users`, existing `bookings`, and existing `tickets` without changing current booking logic.
- `discounts` stores promo codes used by payments.
- `payments` connects payment records to existing `bookings`, `users`, and optional `discounts`.
- `invoices` connects issued invoices to `payments`, existing `bookings`, and `users`.
- `transaction_logs` stores payment gateway attempts, captures, refunds, voids, and webhooks.
- `saved_matches` lets `users` save/favorite football `matches`.

## Key Relationships

- `bookings.user_id -> users.id`
- `bookings.ticket_id -> tickets.id`
- `tickets.user_id -> users.id`
- `seat_categories.stadium_id -> stadiums.id`
- `user_roles.user_id -> users.id`
- `user_roles.role_id -> roles.id`
- `role_permissions.role_id -> roles.id`
- `role_permissions.permission_id -> permissions.id`
- `refresh_tokens.user_id -> users.id`
- `audit_logs.user_id -> users.id`
- `notifications.user_id -> users.id`
- `settings.updated_by -> users.id`
- `files.uploaded_by -> users.id`
- `teams.league_id -> leagues.id`
- `teams.logo_file_id -> files.id`
- `matches.event_id -> events.id`
- `matches.league_id -> leagues.id`
- `matches.stadium_id -> stadiums.id`
- `matches.home_team_id -> teams.id`
- `matches.away_team_id -> teams.id`
- `seats.stadium_id -> stadiums.id`
- `seats.seat_category_id -> seat_categories.id`
- `seat_reservations.match_id -> matches.id`
- `seat_reservations.seat_id -> seats.id`
- `seat_reservations.user_id -> users.id`
- `seat_reservations.booking_id -> bookings.id`
- `seat_reservations.ticket_id -> tickets.id`
- `payments.booking_id -> bookings.id`
- `payments.user_id -> users.id`
- `payments.discount_id -> discounts.id`
- `invoices.payment_id -> payments.id`
- `invoices.booking_id -> bookings.id`
- `invoices.user_id -> users.id`
- `transaction_logs.payment_id -> payments.id`
- `transaction_logs.booking_id -> bookings.id`
- `transaction_logs.user_id -> users.id`
- `saved_matches.user_id -> users.id`
- `saved_matches.match_id -> matches.id`
