# GIS Mapping System — Data Flow Diagrams

## 1. Context-Level DFD

```mermaid
graph TD
    subgraph External Entities
        A[Administrator]
        B[GIS Analyst]
        C[Field Personnel]
        D[Viewer]
        E[External GIS Systems]
    end

    subgraph GIS System
        F[GIS Mapping Platform]
    end

    A -->|Configures users, roles, layers| F
    F -->|Audit logs, notifications| A

    B -->|Creates/edits features, runs analysis| F
    F -->|Maps, reports, analysis results| B

    C -->|Sends GPS location, collects field data| F
    F -->|Syncs data, sends task assignments| C

    D -->|Views maps, queries layers| F
    F -->|Rendered tiles, feature data| D

    E -->|Imports GeoJSON/KML/Shapefile| F
    F -->|Exports GeoJSON/KML/GPX| E
```

---

## 2. Level-1 DFD — Map Rendering Flow

```mermaid
flowchart TD
    UA[User Action: Pan/Zoom/Select Layer]
    UA --> FR[Frontend React App]

    FR -->|1. Request tiles| TS[Tile Server]
    FR -->|2. Request features| API[Backend API]
    FR -->|Query search| ES[Elasticsearch]

    TS -->|3. Query PostGIS| PGSQL[(PostGIS)]
    TS -->|4. Return MVT tiles| FR

    API -->|5. Load feature data| PGSQL
    API -->|6. Cache result| RC[(Redis)]
    API -->|7. Return GeoJSON| FR

    ES -->|8. Geocode result| FR

    FR -->|9. Render map layers| UI[Map Canvas]

    UI -->|10. User interacts| FR
```

---

## 3. Level-1 DFD — GPS Tracking Flow

```mermaid
flowchart TD
    GPS[GPS Receiver - Mobile Device]
    GPS -->|Lat/Lng/Accuracy/Speed| RN[React Native App]

    RN -->|Queue offline if no connection| SQ[(SQLite Local)]

    RN -->|WSS: Location Update| WS[WebSocket Server]

    WS -->|Publish| RP{Redis Pub/Sub}

    RP -->|Location event| BE[Backend Consumer]
    RP -->|Broadcast| DASH[Dashboard Subscribers]

    BE -->|Write track point| PG[(PostGIS GPS Tracks)]
    BE -->|Check geofences| PG

    BE -->|Trigger alert if needed| NTF[Notification Service]
    NTF -->|Push/Email/SMS| USR[Field Personnel / Admin]

    DASH -->|Update real-time marker position| MAP[Monitoring Dashboard]
```

---

## 4. Level-1 DFD — Import/Export Flow

```mermaid
flowchart TD
    USR[User] -->|Upload file| FE[Frontend]
    FE -->|POST /api/imports| API[Import Controller]

    API -->|1. Validate file type & size| BE
    BE -->|2. Store raw file| BS[(MinIO / S3)]
    BS -->|3. Return storage path| BE

    BE -->|4. Dispatch import job| MQ[Message Queue]
    MQ -->|5. Worker picks up job| IW[Import Worker]

    IW -->|6. Read file from| BS
    IW -->|7. Parse & validate geometries| PG[(PostGIS)]
    IW -->|8. Record errors| LL[Import Log]
    IW -->|9. Update search index| ES[Elasticsearch]

    IW -->|10. Invalidate tile cache| RC[(Redis)]
    IW -->|11. Notify on completion| WS[WebSocket]

    WS -->|12. Status update| FE
    FE -->|13. Show result to user| USR

    subgraph Export Path
        USR -->|Request export| FE
        FE -->|GET /api/exports/:id| API
        API -->|Query features| PG
        API -->|Convert format| CONV[Conversion Engine]
        CONV -->|Store in| BS
        BS -->|Pre-signed URL| API
        API -->|Download link| FE
    end
```

---

## 5. Level-1 DFD — Spatial Analysis Flow

```mermaid
flowchart TD
    AN[Analyst] -->|Selects analysis type & parameters| FE[Frontend]

    FE -->|POST /api/analysis| API[Analysis Controller]

    API -->|1. Validate inputs| BE
    BE -->|2. Dispatch analysis job| MQ[Message Queue]
    MQ -->|3. Worker picks up| AW[Analysis Worker]

    AW -->|4. Fetch source features| PG[(PostGIS)]
    AW -->|5. Execute PostGIS spatial SQL| PG
    PG -->|6. Return result geometry + stats| AW

    AW -->|7. Store result| PG[(analysis_results)]
    AW -->|8. Cache for fast re-render| RC[(Redis)]

    AW -->|9. Return result to API| BE
    BE -->|10. Send result to user| WS[WebSocket]

    WS -->|11. Display result overlay| FE
    FE -->|12. Interactive result exploration| AN
```

---

## 6. Data Flow Matrix

| Data Flow             | Source         | Destination    | Protocol    | Frequency   | Payload Size |
| --------------------- | -------------- | -------------- | ----------- | ----------- | ------------ |
| Map Tiles (MVT)       | Tile Server    | Browser        | HTTP/2      | On-demand   | 10-500 KB    |
| Feature CRUD          | Browser        | API            | HTTPS/JSON  | On-demand   | 1-100 KB     |
| GPS Location          | Mobile App     | WebSocket      | WSS         | 3s interval | 200 B        |
| GPS Batch Sync        | Mobile App     | API            | HTTPS/JSON  | On reconnect | 10-500 KB   |
| File Import           | Browser/Mobile | API → MinIO    | HTTPS/Multipart | Weekly   | 1-500 MB     |
| Search Query          | Browser        | Elasticsearch  | HTTPS/JSON  | On-demand   | 1 KB         |
| Analysis Result       | Worker         | Browser (WS)   | WSS/JSON    | On-demand   | 10 KB-10 MB  |
| Audit Events          | API            | PostGIS        | SQL         | Every write | 500 B        |
| Notification          | Backend        | Mobile/Email   | FCM/SMTP    | On event    | 1-10 KB      |
| Auth Token            | API            | Client         | HTTPS/JSON  | Per session | 2 KB         |
