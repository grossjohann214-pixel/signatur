# API Documentation

## Base URL

```
Development: http://localhost:4000
Production: https://api.singulai.com
```

## Authentication

All endpoints require JWT Bearer token:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://api.singulai.com/procedures
```

## Key Endpoints

### Partner Onboarding
- `POST /partners/register` - Register new partner
- `GET /partners/me` - Get current partner profile
- `PUT /partners/branding` - Update branding

### Procedures
- `POST /procedures` - Create procedure
- `GET /procedures/:id` - Get procedure details
- `GET /procedures` - List procedures (tenant-scoped)

### Participants
- `POST /procedures/:id/participants` - Add participant
- `POST /participants/:id/send-link` - Send magic link

### Evidence
- `GET /procedures/:id/evidence` - Get evidence details
- `GET /procedures/:id/protocol` - Get protocol number

Full documentation: http://localhost:4000/api
