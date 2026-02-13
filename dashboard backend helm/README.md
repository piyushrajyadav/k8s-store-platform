# Store Provisioning Platform - Backend API

A simple and clean Node.js Express backend for the Kubernetes Store Provisioning Platform, built with TypeScript.

## Features

- ✅ TypeScript for type safety
- ✅ Express.js REST API
- ✅ JSON file-based storage (no database required)
- ✅ Simple service layer architecture
- ✅ CORS enabled
- ✅ Proper error handling
- ✅ No authentication (as per requirements)

## Store Model

Each store has the following properties:

```typescript
{
  id: string;              // Auto-generated unique ID
  name: string;            // Store name
  status: StoreStatus;     // 'Provisioning' | 'Ready' | 'Failed'
  namespace: string;       // Kubernetes namespace
  url: string;             // Store URL
  createdAt: string;       // ISO timestamp
}
```

## API Endpoints

### 1. Get All Stores
```http
GET /stores
```

**Response:** `200 OK`
```json
[
  {
    "id": "1",
    "name": "My Store",
    "status": "Ready",
    "namespace": "store-1",
    "url": "http://mystore.example.com",
    "createdAt": "2026-02-11T06:24:31.000Z"
  }
]
```

### 2. Get Store by ID
```http
GET /stores/:id
```

**Response:** `200 OK` or `404 Not Found`

### 3. Create Store
```http
POST /stores
Content-Type: application/json

{
  "name": "My New Store",
  "status": "Provisioning",
  "namespace": "store-2",
  "url": "http://newstore.example.com"
}
```

**Response:** `201 Created`
```json
{
  "id": "2",
  "name": "My New Store",
  "status": "Provisioning",
  "namespace": "store-2",
  "url": "http://newstore.example.com",
  "createdAt": "2026-02-11T06:24:31.000Z"
}
```

### 4. Delete Store
```http
DELETE /stores/:id
```

**Response:** `200 OK` or `404 Not Found`

### 5. Health Check
```http
GET /health
```

**Response:** `200 OK`
```json
{
  "status": "healthy",
  "timestamp": "2026-02-11T06:24:31.000Z"
}
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Run in development mode:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Run production build:
```bash
npm start
```

## Project Structure

```
dashboard backend helm/
├── src/
│   ├── models/
│   │   └── Store.ts          # Store type definitions
│   ├── services/
│   │   └── StoreService.ts   # Business logic layer
│   ├── routes/
│   │   └── storeRoutes.ts    # API routes
│   ├── app.ts                # Express app setup
│   └── server.ts             # Entry point
├── data/
│   └── stores.json           # Persistent storage
├── package.json
├── tsconfig.json
└── README.md
```

## Environment Variables

- `PORT` - Server port (default: 3000)

## Development

The backend uses:
- **Express** for the REST API
- **TypeScript** for type safety
- **ts-node** + **nodemon** for hot reloading during development
- **JSON file** for simple data persistence

## Testing the API

Using cURL:

```bash
# Create a store
curl -X POST http://localhost:3000/stores \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Store",
    "status": "Provisioning",
    "namespace": "test-ns",
    "url": "http://test.example.com"
  }'

# Get all stores
curl http://localhost:3000/stores

# Get specific store
curl http://localhost:3000/stores/1

# Delete a store
curl -X DELETE http://localhost:3000/stores/1
```

## Notes

- Data is persisted in `data/stores.json`
- No authentication is implemented (as per requirements)
- CORS is enabled for all origins
- Simple and modular architecture for easy extension
