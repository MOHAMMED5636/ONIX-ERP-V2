# Clients API Design

## Overview
This document outlines the API endpoints for the Clients management system in the ONIX ERP application.

## Base URL
```
http://localhost:3001/api/clients
```

## Authentication
All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### 1. Get All Clients
**GET** `/api/clients`

**Query Parameters:**
- `search` (string, optional): Search term for name, email, or reference number
- `corporate` (string, optional): Filter by client type ("Person" or "Company")
- `leadSource` (string, optional): Filter by lead source
- `page` (number, optional): Page number for pagination (default: 1)
- `limit` (number, optional): Number of items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "referenceNumber": "O-CL-25100bytf",
      "name": "KVIEM REAL ESTATE LLC",
      "isCorporate": "Company",
      "leadSource": "Social Media",
      "rank": "A",
      "email": "kviem@realestate.com",
      "phone": "+971 50 123 4567",
      "address": "Dubai, UAE",
      "nationality": "UAE",
      "idNumber": "784-1985-1234567-8",
      "passportNumber": "A1234567",
      "birthDate": "1985-06-15",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

### 2. Get Single Client
**GET** `/api/clients/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "referenceNumber": "O-CL-25100bytf",
    "name": "KVIEM REAL ESTATE LLC",
    "isCorporate": "Company",
    "leadSource": "Social Media",
    "rank": "A",
    "email": "kviem@realestate.com",
    "phone": "+971 50 123 4567",
    "address": "Dubai, UAE",
    "nationality": "UAE",
    "idNumber": "784-1985-1234567-8",
    "passportNumber": "A1234567",
    "birthDate": "1985-06-15",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 3. Create New Client
**POST** `/api/clients`

**Request Body:**
```json
{
  "name": "John Doe",
  "isCorporate": "Person",
  "leadSource": "Company Website",
  "rank": "B",
  "email": "john@example.com",
  "phone": "+971 50 123 4567",
  "address": "Dubai, UAE",
  "nationality": "UAE",
  "idNumber": "784-1985-1234567-8",
  "passportNumber": "A1234567",
  "birthDate": "1985-06-15"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 11,
    "referenceNumber": "O-CL-25101",
    "name": "John Doe",
    "isCorporate": "Person",
    "leadSource": "Company Website",
    "rank": "B",
    "email": "john@example.com",
    "phone": "+971 50 123 4567",
    "address": "Dubai, UAE",
    "nationality": "UAE",
    "idNumber": "784-1985-1234567-8",
    "passportNumber": "A1234567",
    "birthDate": "1985-06-15",
    "createdAt": "2024-03-15T10:30:00Z",
    "updatedAt": "2024-03-15T10:30:00Z"
  }
}
```

### 4. Update Client
**PUT** `/api/clients/:id`

**Request Body:** Same as create client

**Response:** Same as create client

### 5. Delete Client
**DELETE** `/api/clients/:id`

**Response:**
```json
{
  "success": true,
  "message": "Client deleted successfully"
}
```

### 6. Search Clients
**GET** `/api/clients/search`

**Query Parameters:**
- `q` (string, required): Search query

**Response:** Same as get all clients

### 7. Get Client Statistics
**GET** `/api/clients/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalClients": 150,
    "personClients": 120,
    "companyClients": 30,
    "clientsByRank": {
      "A": 45,
      "B": 60,
      "C": 35,
      "VIP": 10
    },
    "clientsByLeadSource": {
      "Social Media": 50,
      "Company Website": 40,
      "Friends": 35,
      "Referral": 25
    },
    "newClientsThisMonth": 15,
    "newClientsThisWeek": 5
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "name": "Name is required",
    "email": "Invalid email format"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Client not found",
  "message": "No client found with the specified ID"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

## Data Models

### Client Model
```typescript
interface Client {
  id: number;
  referenceNumber: string; // Auto-generated
  name: string;
  isCorporate: "Person" | "Company";
  leadSource: "Social Media" | "Company Website" | "Friends" | "Referral";
  rank: "A" | "B" | "C" | "VIP";
  email: string;
  phone: string;
  address?: string;
  nationality?: string;
  idNumber?: string;
  passportNumber?: string;
  birthDate?: string;
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
}
```

## Business Logic

### Reference Number Generation
- Format: `O-CL-{YYYY}{SR}`
- Where `YYYY` is the current year and `SR` is a sequential number
- Example: `O-CL-2024001`, `O-CL-2024002`

### Validation Rules
- `name`: Required, minimum 2 characters
- `email`: Required, valid email format, unique
- `phone`: Required, valid phone format
- `isCorporate`: Required, must be "Person" or "Company"
- `leadSource`: Required, must be one of the predefined values
- `rank`: Required, must be one of the predefined values

### Search Functionality
- Searches across: name, email, reference number, phone
- Case-insensitive
- Partial matches supported

### Pagination
- Default page size: 10
- Maximum page size: 100
- Page numbers start from 1

## Security Considerations

1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**: Users can only access clients they have permission to view
3. **Input Validation**: All input data is validated and sanitized
4. **Rate Limiting**: API calls are rate-limited to prevent abuse
5. **Data Encryption**: Sensitive data is encrypted at rest

## Performance Considerations

1. **Database Indexing**: Indexes on frequently queried fields (name, email, reference number)
2. **Caching**: Client data is cached for improved performance
3. **Pagination**: Large datasets are paginated to improve response times
4. **Search Optimization**: Full-text search indexes for efficient searching





