# Blog Management REST API

REST API for a blog platform with three access levels: **Admin**, **User**, **Guest**.
Built with Node.js, Express, MySQL, JWT, and bcrypt.

## Postman documentation
Published docs: https://documenter.getpostman.com/view/54598172/2sBYHSz1cm2

## Features
- Register / login with JWT, bcrypt-hashed passwords
- Role-based access control (guest / user / admin)
- Blog CRUD with ownership rules (admin can edit/delete any blog)
- Public blog listing with partial title search and category filter, author info included
- Admin user management (list, get, activate/deactivate)
- Input validation (express-validator), consistent JSON errors, correct HTTP status codes

## Setup
```bash
git clone <your-repo-url> && cd blog-api
npm install
cp .env.example .env        
mysql -u root -p < database/schema.sql
npm run dev               
```
Server runs on `http://localhost:3000`.

### Create the admin user
Register through `POST /api/auth/register`, then promote manually:
```sql
USE blogdb;
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

## Project structure
```
src/
  config/       db pool
  constants/    roles, auth settings
  controllers/  request handling + business logic
  middleware/   authenticate, authorize, validate, errorHandler, rejectProtectedFields
  routes/       URL -> controller mapping
  validators/   express-validator rule sets
  utils/        asyncHandler, response serializers (never expose password)
database/schema.sql
postman/blog-api.postman_collection.json
```

## Endpoints
Send the token as `Authorization: Bearer <token>`.

| Method | Path | Access | Notes |
|---|---|---|---|
| POST | /api/auth/register | Public | 201; role/isActive in body are ignored |
| POST | /api/auth/login | Public | 401 bad credentials, 403 deactivated |
| GET | /api/users/profile | Auth | Own profile |
| PUT | /api/users/profile/update | Auth | firstname/lastname only; role/isActive -> 403 |
| PATCH | /api/users/password | Auth | Min 8 chars, hashed |
| GET | /api/users | Admin | No passwords returned |
| GET | /api/users/:id | Admin | 404 if missing |
| PATCH | /api/users/:id/status | Admin | `{ "isActive": true/false }` |
| GET | /api/blogs | Public | `?title=` (partial) `&category=` |
| GET | /api/blogs/:id | Public | 404 if missing |
| POST | /api/blogs/create | Auth | userId taken from token |
| PUT | /api/blogs/update/:id | Owner or Admin | 403 otherwise |
| DELETE | /api/blogs/:id | Owner or Admin | 403 otherwise |

## Status codes
200 OK, 201 Created, 400 validation/invalid ID, 401 missing/invalid token or bad credentials,
403 forbidden, 404 not found, 409 duplicate email, 500 unexpected error.

## Design notes
- Deactivation takes effect immediately: the auth middleware re-checks `isActive` in the DB on every request.
- Login returns the same 401 message for unknown email and wrong password (prevents email enumeration).
- All SQL uses parameterized queries.
- An admin cannot deactivate their own account (prevents lock-out).

## Testing
Import `postman/blog-api.postman_collection.json` into Postman. Set `baseUrl` if your port differs.
Run the **1. Auth** folder first (it saves tokens), run the admin SQL above after registering the admin
account and before "Login admin", then run the remaining folders in order.
