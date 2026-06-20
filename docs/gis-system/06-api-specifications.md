# GIS Mapping System — API Specifications

## 1. API Design Principles

- **RESTful** resource-oriented endpoints
- **Base URL**: `/api/v1`
- **Format**: JSON (GeoJSON for spatial data)
- **Auth**: Bearer tokens (Sanctum) + OAuth 2.0
- **Pagination**: Cursor-based for large spatial queries
- **Versioning**: URL-based (`/v1/`, `/v2/`)
- **Idempotency**: Idempotency keys on POST for imports

---

## 2. Authentication & Users

| Method | Endpoint                      | Description            | Auth     |
| ------ | ----------------------------- | ---------------------- | -------- |
| POST   | `/auth/login`                 | Login, get token       | Public   |
| POST   | `/auth/logout`                | Invalidate token       | Bearer   |
| POST   | `/auth/refresh`               | Refresh token          | Bearer   |
| GET    | `/auth/me`                    | Current user profile   | Bearer   |
| PUT    | `/auth/me`                    | Update profile         | Bearer   |
| GET    | `/users`                      | List users (admin)     | Bearer   |
| POST   | `/users`                      | Create user (admin)    | Bearer   |
| PUT    | `/users/{id}`                 | Update user (admin)    | Bearer   |
| DELETE | `/users/{id}`                 | Soft-delete user       | Bearer   |
| GET    | `/users/{id}/permissions`     | User's layer perms     | Bearer   |
| PUT    | `/users/{id}/roles`           | Assign roles           | Bearer   |

---

## 3. Layers

| Method | Endpoint              | Description              | Auth     |
| ------ | --------------------- | ------------------------ | -------- |
| GET    | `/layers`             | List layers (filtered)   | Bearer   |
| POST   | `/layers`             | Create new layer         | Bearer   |
| GET    | `/layers/{id}`        | Get layer details        | Bearer   |
| PUT    | `/layers/{id}`        | Update layer             | Bearer   |
| DELETE | `/layers/{id}`        | Soft-delete layer        | Bearer   |
| GET    | `/layers/{id}/features` | Query features in layer | Bearer   |
| PUT    | `/layers/{id}/style`  | Update style config      | Bearer   |
| GET    | `/layers/{id}/permissions` | List layer permissions | Bearer   |
| PUT    | `/layers/{id}/permissions` | Set layer permissions | Bearer   |

**Query Parameters for GET `/layers`:**
- `category` — filter by category
- `geometry_type` — filter by geometry type
- `is_visible` — boolean
- `search` — name/description search
- `bbox` — bounding box for spatial filter

---

## 4. Features (Spatial CRUD)

| Method   | Endpoint                     | Description                           | Auth     |
| -------- | ---------------------------- | ------------------------------------- | -------- |
| GET      | `/layers/{id}/features`      | List features in layer (paginated)    | Bearer   |
| POST     | `/layers/{id}/features`      | Create feature (GeoJSON)              | Bearer   |
| GET      | `/features/{id}`             | Get single feature                    | Bearer   |
| PUT      | `/features/{id}`             | Update feature                        | Bearer   |
| PATCH    | `/features/{id}`             | Partial update (properties)           | Bearer   |
| DELETE   | `/features/{id}`             | Soft-delete feature                   | Bearer   |
| POST     | `/features/{id}/restore`     | Restore soft-deleted feature          | Bearer   |
| POST     | `/features/batch`            | Batch create/update (up to 500)       | Bearer   |
| DELETE   | `/features/batch`            | Batch delete by IDs                   | Bearer   |

**Request Body for POST `/layers/{id}/features`:**
```json
{
    "type": "Feature",
    "geometry": {
        "type": "Point",
        "coordinates": [36.82, -1.28]
    },
    "properties": {
        "name": "Nairobi Water Pump 01",
        "status": "active",
        "install_date": "2025-06-01"
    }
}
```

**Query Parameters for GET `/layers/{id}/features`:**
- `bbox` — bounding box (minLng,minLat,maxLng,maxLat)
- `page` / `cursor` — pagination
- `per_page` — page size (max 1000)
- `fields` — comma-separated properties to return
- `filter` — JSON filter expression on properties
- `simplify` — tolerance in meters for geometry simplification

---

## 5. GPS Tracking

| Method | Endpoint                             | Description                              | Auth     |
| ------ | ------------------------------------ | ---------------------------------------- | -------- |
| POST   | `/tracking/sessions`                 | Start tracking session                   | Bearer   |
| PUT    | `/tracking/sessions/{id}/stop`       | End session                              | Bearer   |
| GET    | `/tracking/sessions`                 | List user's sessions                     | Bearer   |
| POST   | `/tracking/locations`                | Push single location                     | Bearer   |
| POST   | `/tracking/locations/batch`          | Push batch locations (offline sync)      | Bearer   |
| GET    | `/tracking/sessions/{id}/locations`  | Get track history as GeoJSON             | Bearer   |
| GET    | `/tracking/live`                     | Get currently active users (admin)       | Bearer   |
| GET    | `/tracking/sessions/{id}/summary`    | Distance, avg speed, duration            | Bearer   |

---

## 6. Spatial Analysis

| Method | Endpoint                        | Description                              | Auth     |
| ------ | ------------------------------- | ---------------------------------------- | -------- |
| POST   | `/analysis/buffer`              | Create buffer around features            | Bearer   |
| POST   | `/analysis/proximity`           | Find features within distance            | Bearer   |
| POST   | `/analysis/route`               | Calculate shortest path                  | Bearer   |
| POST   | `/analysis/hotspot`             | DBSCAN hotspot detection                 | Bearer   |
| POST   | `/analysis/area`                | Calculate area/perimeter                 | Bearer   |
| POST   | `/analysis/intersection`        | Geometric intersection                   | Bearer   |
| POST   | `/analysis/union`               | Geometric union                          | Bearer   |
| GET    | `/analysis/results/{id}`        | Get stored analysis result               | Bearer   |
| DELETE | `/analysis/results/{id}`        | Delete analysis result                   | Bearer   |
| GET    | `/analysis/results`             | List user's analysis history             | Bearer   |

**Example Request — Buffer:**
```json
POST /api/v1/analysis/buffer
{
    "layer_id": "uuid-of-layer",
    "feature_ids": ["uuid-1", "uuid-2"],
    "distance": 500,
    "distance_unit": "meters",
    "merge_results": true
}
```

**Example Request — Proximity:**
```json
POST /api/v1/analysis/proximity
{
    "source_layer_id": "uuid",
    "target_layer_id": "uuid",
    "radius": 1000,
    "radius_unit": "meters",
    "return_geometry": true
}
```

---

## 7. Import / Export

| Method | Endpoint                    | Description                           | Auth     |
| ------ | --------------------------- | ------------------------------------- | -------- |
| POST   | `/imports`                  | Upload file for import                | Bearer   |
| GET    | `/imports`                  | List user's imports                   | Bearer   |
| GET    | `/imports/{id}`             | Get import status & errors            | Bearer   |
| POST   | `/imports/{id}/cancel`      | Cancel pending import                 | Bearer   |
| GET    | `/imports/{id}/preview`     | Preview first 20 features             | Bearer   |
| POST   | `/imports/{id}/columns`     | Map CSV columns to attributes         | Bearer   |

| Method | Endpoint                    | Description                           | Auth     |
| ------ | --------------------------- | ------------------------------------- | -------- |
| POST   | `/exports`                  | Request data export                   | Bearer   |
| GET    | `/exports`                  | List exports                          | Bearer   |
| GET    | `/exports/{id}`             | Get export status                     | Bearer   |
| GET    | `/exports/{id}/download`    | Download exported file (pre-signed)   | Bearer   |
| DELETE | `/exports/{id}`             | Delete export                         | Bearer   |

**Import request:**
```
POST /api/v1/imports
Content-Type: multipart/form-data

file: <binary>
layer_id: "uuid"
format: "shapefile" | "geojson" | "kml" | "csv" | "gpx"
crs: "EPSG:4326" (optional, auto-detected if .prj exists)
csv_config: { "lat_column": "lat", "lng_column": "lon" } (for CSV only)
```

---

## 8. Search & Geocoding

| Method | Endpoint                 | Description                            | Auth     |
| ------ | ------------------------ | -------------------------------------- | -------- |
| GET    | `/search/geocode`        | Forward geocode (address → coords)     | Bearer   |
| GET    | `/search/reverse`        | Reverse geocode (coords → address)     | Bearer   |
| GET    | `/search/autocomplete`   | Address autocomplete                   | Public   |
| GET    | `/search/features`       | Full-text search across feature props  | Bearer   |

**Search parameters:**
```
GET /api/v1/search/geocode?q=123+Main+St&limit=5&lang=en
GET /api/v1/search/reverse?lat=-1.28&lng=36.82
GET /api/v1/search/autocomplete?q=Main+St&bbox=36.7,-1.4,37.0,-1.1
GET /api/v1/search/features?q="water+pump"&layer_id=uuid&bbox=...
```

---

## 9. Thematic Maps & Reports

| Method | Endpoint                       | Description                    | Auth     |
| ------ | ------------------------------ | ------------------------------ | -------- |
| POST   | `/thematic-maps`               | Create thematic map            | Bearer   |
| GET    | `/thematic-maps`               | List thematic maps             | Bearer   |
| GET    | `/thematic-maps/{id}`          | Get config & data URL          | Bearer   |
| PUT    | `/thematic-maps/{id}`          | Update config                  | Bearer   |
| DELETE | `/thematic-maps/{id}`          | Delete                         | Bearer   |
| POST   | `/reports/generate`            | Generate analytical PDF report | Bearer   |
| GET    | `/reports/{id}`                | Get report status/URL          | Bearer   |

---

## 10. WebSocket Events

**Connection:** `wss://api.gis-system.com/ws?token={jwt}`

| Event (Client → Server)       | Description                     |
| ----------------------------- | ------------------------------- |
| `location:update`             | Push GPS location               |
| `location:batch`              | Push batch locations            |
| `map:subscribe`               | Subscribe to layer updates      |
| `map:unsubscribe`             | Unsubscribe from layer updates  |
| `feature:lock`                | Lock feature for editing        |
| `feature:unlock`              | Release feature lock            |

| Event (Server → Client)       | Description                     |
| ----------------------------- | ------------------------------- |
| `layer:{id}:updated`          | Layer metadata changed          |
| `feature:{id}:created`        | New feature in subscribed layer |
| `feature:{id}:updated`        | Feature updated                 |
| `feature:{id}:deleted`        | Feature deleted                 |
| `location:{userId}:updated`   | GPS location of tracked user    |
| `import:{id}:progress`        | Import progress percentage      |
| `notification`                | System notification             |

---

## 11. Common Error Responses

```json
// 400 Bad Request
{
    "error": "validation_error",
    "message": "Invalid geometry type. Expected Point, received Polygon.",
    "details": {
        "geometry": ["Expected Point geometry"]
    }
}

// 401 Unauthorized
{ "error": "unauthorized", "message": "Invalid or expired token." }

// 403 Forbidden
{ "error": "forbidden", "message": "You do not have 'edit' permission on this layer." }

// 404 Not Found
{ "error": "not_found", "message": "Feature not found." }

// 429 Too Many Requests
{ "error": "rate_limited", "message": "Too many requests. Retry after 30 seconds." }

// 422 Unprocessable Entity
{
    "error": "geometry_error",
    "message": "Feature geometry is self-intersecting and cannot be saved.",
    "details": { "self_intersection_point": [36.82, -1.28] }
}
```

---

## 12. Rate Limiting

| Endpoint Group         | Limit          | Window |
| ---------------------- | -------------- | ------ |
| `/auth/*`              | 10 req/min     | 1 min  |
| `/features/*`          | 500 req/min    | 1 min  |
| `/analysis/*`          | 30 req/min     | 1 min  |
| `/imports/*`           | 5 req/min      | 1 min  |
| `/search/*`            | 100 req/min    | 1 min  |
| `/tiles/*`             | 1000 req/min   | 1 min  |
| `POST /tracking/*`     | 60 req/min     | 1 min  |

Rate limit headers returned: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.
