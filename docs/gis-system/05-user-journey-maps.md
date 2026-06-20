# GIS Mapping System — User Journey Maps

## 1. GIS Analyst — Spatial Analysis Journey

```mermaid
journey
    title GIS Analyst performs proximity analysis
    section Setup
        Log in to the GIS platform: 3: Analyst
        Navigate to Map View: 4: Analyst
        Search for target area: 5: Analyst
        Load administrative + roads layers: 4: Analyst
    section Analysis
        Select "Proximity Analysis" tool: 5: Analyst
        Choose "Schools" as target layer: 4: Analyst
        Set 500m buffer radius: 5: Analyst
        Select "Health Facilities" as comparison layer: 4: Analyst
        Click "Run Analysis": 5: Analyst
    section Review
        View result table with distances: 5: Analyst
        Inspect intersecting features on map: 5: Analyst
        Export results as CSV: 4: Analyst
        Save analysis to project: 5: Analyst
    section Report
        Add result to new thematic map: 4: Analyst
        Generate PDF report: 3: Analyst
        Share report link with stakeholders: 4: Analyst
```

---

## 2. Field Personnel — GPS Data Collection Journey

```mermaid
journey
    title Field Personnel collects asset data
    section Pre-Field
        Log in on mobile app (offline-capable): 4: Field Worker
        Sync assigned task list: 5: Field Worker
        Download target area tiles for offline: 5: Field Worker
        Travel to field location: 3: Field Worker
    section Data Collection
        Open "Water Points" layer: 5: Field Worker
        GPS auto-locate shows current position: 5: Field Worker
        Tap "Add Point" and place marker: 5: Field Worker
        Camera capture asset photo: 4: Field Worker
        Fill attribute form (type, status, condition): 4: Field Worker
        Save feature (queued locally): 5: Field Worker
        Repeat for next 5 assets: 4: Field Worker
    section Sync
        Return to coverage area: 5: Field Worker
        Auto-sync triggers: 5: Field Worker
        View sync status with success confirmation: 5: Field Worker
        Resolve any conflict notifications: 3: Field Worker
```

---

## 3. Administrator — System Configuration Journey

```mermaid
journey
    title Administrator sets up RBAC
    section User Management
        Log in as admin: 5: Admin
        Navigate to User Management: 4: Admin
        Create 3 new user accounts: 4: Admin
        Assign roles: GIS Analyst, Field Personnel, Viewer: 5: Admin
        Set password/reset policy: 4: Admin
    section Layer Permissions
        Go to Layer Manager: 4: Admin
        Create "Critical Infrastructure" layer: 5: Admin
        Set geometry type: MultiPolygon: 4: Admin
        Define attribute schema: 5: Admin
        Assign per-layer permissions: 4: Admin
        - GIS Analysts: view, edit, delete, export
        - Field Personnel: view, edit
        - Viewers: view only
        Test permissions as viewer user: 5: Admin
    section Monitoring
        Open Audit Log dashboard: 4: Admin
        Filter by last 24 hours: 4: Admin
        Review feature edit history: 5: Admin
        Export audit trail for compliance: 4: Admin
```

---

## 4. Viewer — Map Exploration Journey

```mermaid
journey
    title Viewer explores published maps
    section Discovery
        Receive shared map link via email: 5: Viewer
        Click link and view public map: 5: Viewer
        Accept terms of use: 3: Viewer
        Explore default basemap: 4: Viewer
    section Interaction
        Zoom in to city level: 5: Viewer
        Toggle layer list: 4: Viewer
        Enable "Land Parcels" and "Buildings": 4: Viewer
        Click on a building feature: 5: Viewer
        View popup with property attributes: 5: Viewer
        Search for "Hospitals" in search bar: 5: Viewer
        View geocoded results and centre map: 4: Viewer
    section Export
        Print current map view: 3: Viewer
        Download visible features as CSV: 2: Viewer
        Bookmark current viewport: 4: Viewer
```

---

## 5. Cross-Cutting User Actions

| Action               | Admin | Analyst | Field | Viewer |
| -------------------- | :---: | :-----: | :---: | :----: |
| View map             |   ✓   |    ✓    |   ✓   |   ✓    |
| Search & geocode     |   ✓   |    ✓    |   ✓   |   ✓    |
| Toggle layers        |   ✓   |    ✓    |   ✓   |   ✓    |
| View feature details |   ✓   |    ✓    |   ✓   |   ✓    |
| Create features      |   ✓   |    ✓    |   ✓   |   ✗    |
| Edit features        |   ✓   |    ✓    |   ✓   |   ✗    |
| Delete features      |   ✓   |    ✓    |   ✗   |   ✗    |
| Spatial analysis     |   ✓   |    ✓    |   ✗   |   ✗    |
| Import data          |   ✓   |    ✓    |   ✓   |   ✗    |
| Export data          |   ✓   |    ✓    |   ✓   |   ✓*   |
| Create layers        |   ✓   |    ✓    |   ✗   |   ✗    |
| Manage permissions   |   ✓   |    ✗    |   ✗   |   ✗    |
| View audit logs      |   ✓   |    ✗    |   ✗   |   ✗    |
| System configuration |   ✓   |    ✗    |   ✗   |   ✗    |

*Export limited to CSV within allowed layers.
