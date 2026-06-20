# GIS Mapping System — Architecture Overview

## 1. System Context

The GIS Mapping System is a web-based spatial data management platform that supports interactive mapping, real-time GPS tracking, spatial analysis, role-based access control, and field data collection for mobile teams.

---

## 2. High-Level System Architecture (C4 — Container View)

```mermaid
C4Context
  Person(admin, "Administrator", "System configuration & user management")
  Person(analyst, "GIS Analyst", "Spatial analysis & map creation")
  Person(field, "Field Personnel", "Field data collection via mobile")
  Person(viewer, "Viewer", "Read-only map access")

  System_Boundary(gis_system, "GIS Mapping System") {
    Container(web_app, "Web Application", "React + Leaflet", "Interactive map UI")
    Container(mobile_app, "Mobile App", "React Native + MapLibre", "Field data collection")
    Container(api_gw, "API Gateway", "Nginx / AWS API Gateway", "Request routing & auth")
    Container(backend, "Backend API", "Laravel + PHP", "Business logic & spatial ops")
    Container(ws_server, "WebSocket Server", "Laravel Reverb / Node.js", "Real-time GPS tracking")
    Container(spatial_db, "Spatial Database", "PostgreSQL + PostGIS", "Spatial data storage")
    Container(cache, "Cache Layer", "Redis", "Session, tile cache, rate limiting")
    Container(tile_server, "Tile Server", "PGTile / Mapproxy", "Raster & vector tile serving")
    Container(blob_store, "Blob Storage", "S3 / MinIO", "Shapefiles, GeoJSON, KML, CSVs")
    Container(search_engine, "Search Engine", "Elasticsearch", "Geocoding & full-text search")
    Container(message_queue, "Message Queue", "RabbitMQ / Redis", "Async processing jobs")
  }

  Rel(admin, web_app, "Uses", "HTTPS")
  Rel(analyst, web_app, "Uses", "HTTPS")
  Rel(field, mobile_app, "Uses", "HTTPS/WSS")
  Rel(viewer, web_app, "Uses", "HTTPS")

  Rel(web_app, api_gw, "API calls", "REST/GraphQL")
  Rel(mobile_app, api_gw, "API calls", "REST/GraphQL")
  Rel(api_gw, backend, "Routes", "Internal")
  Rel(api_gw, ws_server, "WebSocket upgrade", "WSS")
  Rel(backend, spatial_db, "Read/Write", "SQL/PostGIS")
  Rel(backend, cache, "Cache data", "Redis protocol")
  Rel(backend, blob_store, "File operations", "S3 API")
  Rel(backend, search_engine, "Index/Search", "Elasticsearch API")
  Rel(backend, message_queue, "Dispatch jobs", "AMQP")
  Rel(ws_server, cache, "Pub/Sub", "Redis")
  Rel(tile_server, spatial_db, "Query tiles", "SQL")
```

---

## 3. Technology Stack

| Layer              | Technology                                                       |
| ------------------ | ---------------------------------------------------------------- |
| **Frontend**       | React 18 + TypeScript, Leaflet/MapLibre GL JS, Deck.gl, Turf.js  |
| **Mobile**         | React Native + MapLibre GL, Expo, GPS native modules              |
| **Backend**        | Laravel 11 + PHP 8.3, Spatie/Laravel-Permission, Laravel Horizon  |
| **Spatial DB**     | PostgreSQL 16 + PostGIS 3.4, pgRouting for network analysis      |
| **Tile Server**    | Martin (vector tiles), pg_tileserv, Mapproxy (raster)            |
| **Cache**          | Redis 7 + RedisJSON + RediSearch                                 |
| **Search**         | Elasticsearch 8 + Geo-shapes                                    |
| **Message Queue**  | RabbitMQ 3                                                       |
| **Object Store**   | MinIO (on-prem) / AWS S3 (cloud)                                 |
| **Auth**           | Laravel Sanctum (API tokens) + OAuth 2.0 / OIDC (Keycloak)      |
| **WebSocket**      | Laravel Reverb (scalable WebSockets)                             |
| **Monitoring**     | Prometheus + Grafana, Sentry, ELK stack                          |
| **CI/CD**          | GitHub Actions / GitLab CI, Docker, Kubernetes                   |
| **Infrastructure** | AWS / Azure / On-prem, Terraform / Pulumi                        |

---

## 4. Module Breakdown

### 4.1 Core Modules

| Module                  | Responsibility                                               |
| ----------------------- | ------------------------------------------------------------ |
| **Map Engine**          | Render interactive maps, vector/raster tiles, layer toggling |
| **Layer Manager**       | CRUD for layers, style configuration, ordering, grouping     |
| **Feature Editor**      | Create/edit/delete points, lines, polygons with snapping     |
| **GPS Tracker**         | Real-time location ingestion via WebSocket, track history    |
| **Spatial Analysis**    | Buffer, proximity, route analysis, hotspot detection, area   |
| **Import/Export**       | GeoJSON, KML, Shapefile, CSV, GPX conversion & validation    |
| **Thematic Mapping**    | Choropleth, heatmaps, cluster maps, proportional symbols     |
| **Reporting**           | PDF/CSV report generation, scheduled exports                 |
| **User Management**     | RBAC with granular permissions per layer/feature             |
| **Geocoding**           | Forward/reverse geocoding, address autocomplete              |
| **Audit Trail**         | Full write-ahead logging of all spatial changes              |

---

## 5. Layer Types

| Layer Category       | Examples                                              | Geometry Types   |
| -------------------- | ----------------------------------------------------- | ---------------- |
| Administrative       | Country, state, district, ward boundaries             | MultiPolygon     |
| Roads & Transport    | Highways, streets, rail, pedestrian paths             | MultiLineString  |
| Buildings            | Footprints, floors, entrances                         | MultiPolygon     |
| Land Parcels         | Property boundaries, zoning, ownership                | MultiPolygon     |
| Utilities            | Water pipes, power lines, fiber, sewer, gas           | MultiLineString  |
| Environmental        | Flood zones, vegetation, soil, elevation contours     | Polygon / Line   |
| Custom Layers        | User-defined point markers, sketches, annotations     | Mixed            |

---

## 6. Key Design Decisions

| Decision                     | Rationale                                                              |
| ---------------------------- | ---------------------------------------------------------------------- |
| PostGIS over proprietary DB  | Open-source, mature spatial SQL, extensive indexing (GIST, BRIN)       |
| Vector tiles (MVT)           | High performance, client-side rendering, smaller payload than raster   |
| Laravel + React              | Leverages existing stack, rich ecosystem for permissions & queues      |
| WebSocket for GPS            | Sub-second location updates for field teams                            |
| Elasticsearch for search     | Geospatial queries (geo_shape, geo_distance), autocomplete, fuzzy      |
| Message queue for imports    | Large file processing (Shapefiles) can take minutes — async is needed  |
