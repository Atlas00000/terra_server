# API Reference

Quick reference guide for Terra Industries Backend API.

**Base URL:** `https://terraserver-production.up.railway.app/api/v1`  
**Documentation:** [Swagger UI](https://terraserver-production.up.railway.app/api-docs)

---

## Authentication

All protected endpoints require JWT token in header:
```
Authorization: Bearer <your_jwt_token>
```

### Get Token
```bash
POST /auth/login
{
  "email": "admin@terra.com",
  "password": "Admin123!"
}

Response:
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": { ... }
}
```

---

## Quick Examples

### Search Everything
```bash
GET /search/global?q=artemis

Response:
{
  "products": [...],
  "news": [...],
  "inquiries": [...],
  "total": 3
}
```

### Get All News
```bash
GET /news

Response:
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25
  }
}
```

### Submit Inquiry
```bash
POST /inquiries
{
  "fullName": "John Smith",
  "email": "john@company.com",
  "company": "Defense Corp",
  "inquiryType": "product",
  "message": "Interested in Artemis UAV"
}
```

### Upload Media (Admin)
```bash
POST /media/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- file: [binary]
- category: "image"
- tags: ["artemis", "uav"]
```

---

## Common Responses

### Success (200)
```json
{
  "id": "uuid",
  "title": "News Title",
  "createdAt": "2025-11-07T00:00:00Z"
}
```

### Error (400)
```json
{
  "statusCode": 400,
  "message": ["title should not be empty"],
  "error": "Bad Request"
}
```

### Unauthorized (401)
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

## Rate Limits

- **General:** 100 requests / 15 minutes
- **Auth:** 10 requests / 15 minutes
- **Upload:** 5 files / 15 minutes

---

For full documentation, visit: [Swagger API Docs](https://terraserver-production.up.railway.app/api-docs)

