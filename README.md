# Blog Management REST API

REST API for a blog platform with three access levels: **Admin**, **User** and **Guest**.
It supports authentication, user management, blog management, role-based authorization,
input validation, and public blog search and filtering.

## Tech Stack

- Node.js + Express 4
- MySQL with the `mysql2` driver (parameterized queries only)
- JWT (`jsonwebtoken`) for token-based authentication
- bcrypt for password hashing
- express-validator for input validation
- dotenv for configuration

## Project Structure

```
blog-api/
├── database/schema.sql        # database and table creation script
├── postman/                   # Postman collection export
├── src/
│   ├── config/db.js           # MySQL connection pool
│   ├── constants/             # roles, auth settings (no magic values)
│   ├── controllers/           # business logic (auth, user, blog)
│   ├── middleware/            # authenticate, authorize, validate,
│   │                          # rejectProtectedFields, errorHandler
│   ├── routes/                # URL -> controller mapping
│   ├── validators/            # express-validator rule sets
│   ├── utils/                 # asyncHandler, response serializers
│   └── app.js                 # express app and route mounting
└── server.js                  # entry point
```

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`,
   `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `JWT_EXPIRES_IN`.
3. Create the database and tables by running `database/schema.sql` in MySQL
   (command line: `mysql -u root -p < database/schema.sql`, or run it as a script in DBeaver).
4. `npm run dev` (or `npm start`). The server runs on `http://localhost:3000` by default.

### Creating an admin user

Admins are never created through the API. Register a user normally, then run in MySQL:

```sql
UPDATE blogdb.users SET role = 'admin' WHERE email = 'admin@example.com';
```

Log in again afterwards to get a token for the admin account.

## Authorization Model

- `authenticate` checks the `Authorization: Bearer <token>` header, verifies the JWT, and
  re-checks in the database that the account exists and is active. A deactivated user loses
  access immediately, even with an unexpired token.
- `authorize(ROLES.ADMIN)` restricts a route to admins.
- Blog update and delete follow an ownership rule: the blog's owner **or** an admin.
- Registration ignores any `role` sent by the client. New accounts are always `user`.
- Profile updates accept only `firstname` and `lastname`. Sending `role` or `isActive` returns 403.
- An admin cannot deactivate their own account.

## Endpoints

Send the token as `Authorization: Bearer <token>`.

| #  | Method | Endpoint                  | Access     | Purpose                         |
|----|--------|---------------------------|------------|---------------------------------|
| 1  | POST   | /api/auth/register        | Public     | Register a new user             |
| 2  | POST   | /api/auth/login           | Public     | Login and receive auth token    |
| 3  | GET    | /api/users                | Admin      | Get all users                   |
| 4  | GET    | /api/users/:id            | Admin      | Get a specific user             |
| 5  | PATCH  | /api/users/:id/status     | Admin      | Activate/deactivate a user      |
| 6  | GET    | /api/users/profile        | User/Admin | Get own profile                 |
| 7  | PUT    | /api/users/profile/update | User/Admin | Update own profile              |
| 8  | PATCH  | /api/users/password       | User/Admin | Update own password             |
| 9  | POST   | /api/blogs/create         | User/Admin | Create a blog                   |
| 10 | GET    | /api/blogs                | Public     | Get blog list / search / filter |
| 11 | GET    | /api/blogs/:id            | Public     | Get a specific blog             |
| 12 | PUT    | /api/blogs/update/:id     | User/Admin | Update a blog                   |
| 13 | DELETE | /api/blogs/delete/:id     | User/Admin | Delete a blog                   |

`GET /api/blogs` supports `?title=` (partial match) and `?category=` (exact match). They can be combined.
`DELETE /api/blogs/:id` also works as an alias.

## Status Codes

| Code | Meaning |
|------|---------|
| 200 / 201 | Success / created |
| 400 | Validation error or invalid ID |
| 401 | Missing or invalid token, or wrong credentials |
| 403 | Not allowed (wrong role, not the owner, deactivated account) |
| 404 | Resource not found |
| 409 | Email already registered |
| 500 | Unexpected server error |

## Error Response Shape

```json
{ "message": "You are not authorized to update this blog." }
```

Validation errors also include the failing fields:

```json
{
  "message": "Validation failed.",
  "errors": [{ "field": "email", "message": "Email format is invalid." }]
}
```

## Postman

Published documentation: https://documenter.getpostman.com/view/54598172/2sBYHSz1m2

The collection export is in `postman/blog-api.postman_collection.json`.
Run it with the server up. Before the first run, promote the admin account (see above).
