# GIS Mapping System — Workflow Diagrams

## 1. End-to-End GIS Data Lifecycle

```mermaid
flowchart TD
    A[Data Acquisition] --> B[Validation & Cleaning]
    B --> C[Import & Conversion]
    C --> D[Spatial Storage]
    D --> E[Style & Classification]
    E --> F[Map Publishing]
    F --> G[Visualization & Analysis]
    G --> H[Data Export / Reporting]
    H --> A

    style A fill:#4CAF50,color:#fff
    style F fill:#2196F3,color:#fff
    style G fill:#FF9800,color:#fff
    style H fill:#9C27B0,color:#fff
```

---

## 2. Feature Editing Workflow

```mermaid
flowchart LR
    A[User selects layer] --> B[Choose geometry type]
    B --> C{Edit mode}
    C -->|Create| D[Click map to place vertices]
    C -->|Edit| E[Select existing feature]
    C -->|Delete| F[Confirm deletion]
    D --> G[Snap to existing features]
    G --> H[Attribute form opens]
    E --> H
    H --> I[Validate geometry & attributes]
    I --> J[Save to PostGIS via API]
    J --> K[Regenerate vector tiles]
    K --> L[Update map display]

    style D fill:#E3F2FD
    style H fill:#FFF3E0
    style I fill:#F3E5F5
```

---

## 3. GPS Tracking Workflow

```mermaid
sequenceDiagram
    participant Mobile App
    participant WebSocket Server
    participant Redis Pub/Sub
    participant Backend API
    participant PostGIS

    loop Every 3 seconds (or 10m movement)
        Mobile App->>WebSocket Server: WSS: {"lat": -1.28, "lng": 36.82, "accuracy": 5, "speed": 12, "heading": 180, "user_id": 42, "tracking_session": "abc123"}
        WebSocket Server->>Redis Pub/Sub: Publish location update
        Redis Pub/Sub->>Backend API: Consume location event
        Backend API->>PostGIS: INSERT INTO gps_tracks (user_id, geom, accuracy, speed, heading, recorded_at)
        Backend API->>Redis Pub/Sub: Publish to user's channel
        Redis Pub/Sub->>WebSocket Server: Broadcast to subscribed dashboards
    end

    Note over WebSocket Server: If connection drops, buffer up to 5 minutes of locations on-device and sync on reconnect
```

---

## 4. Import Processing Workflow

```mermaid
flowchart TD
    A[User uploads file] --> B{File type?}
    B -->|GeoJSON| C[Parse GeoJSON]
    B -->|KML| D[Convert KML → GeoJSON]
    B -->|Shapefile (ZIP)| E[Extract .shp, .shx, .dbf, .prj]
    B -->|CSV| F[Parse CSV with lat/lng columns]
    B -->|GPX| G[Parse GPX tracks/waypoints]

    C --> H[Geometry validation]
    D --> H
    E --> H
    F --> H
    G --> H

    H --> I{Valid?}
    I -->|No| J[Return error report with line-level issues]
    I -->|Yes| K[Transform to EPSG:4326]
    K --> L[Assign to target layer]
    L --> M[Dispatch batch insert job to queue]
    M --> N[Insert into PostGIS via COPY command]
    N --> O[Update search index]
    O --> P[Regenerate tile cache]
    P --> Q[Notify user via WebSocket / email]

    style J fill:#f44336,color:#fff
    style Q fill:#4CAF50,color:#fff
```

---

## 5. Spatial Analysis Workflow

```mermaid
flowchart TD
    A[User selects analysis type] --> B{Analysis type}

    B -->|Buffer| C[Select feature + distance]
    C --> D[ST_Buffer(geom, distance)]
    D --> E[Display buffer zone + area stats]

    B -->|Proximity| F[Select feature + radius]
    F --> G[ST_DWithin(feature, target_layer, radius)]
    G --> H[Return intersecting features with distances]

    B -->|Route| I[Select start + end points]
    I --> J[pgr_dijkstra / pgr_astar]
    J --> K[Display route polyline + distance + ETA]

    B -->|Hotspot| L[Select point dataset + bandwidth]
    L --> M[ST_ClusterDBSCAN / Kernel Density Estimation]
    M --> N[Display heatmap overlay + cluster boundaries]

    B -->|Area| O[Select polygon features]
    O --> P[ST_Area(geom) / ST_Perimeter(geom)]
    P --> Q[Display area in sq m, acres, hectares]

    style A fill:#2196F3,color:#fff
    style E fill:#4CAF50,color:#fff
    style H fill:#4CAF50,color:#fff
    style K fill:#4CAF50,color:#fff
    style N fill:#4CAF50,color:#fff
    style Q fill:#4CAF50,color:#fff
```
