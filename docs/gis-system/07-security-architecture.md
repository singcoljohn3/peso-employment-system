# GIS Mapping System — Security Architecture

## 1. Security Principles

- **Defence in Depth**: Multiple security layers at network, application, and data levels
- **Least Privilege**: Granular per-layer, per-action permissions
- **Zero Trust**: Every request authenticated, authorised, and validated
- **Encrypt at Rest and in Transit**: TLS 1.3 for all communication, AES-256 for stored data
- **Audit Everything**: Immutable audit trail for all spatial data mutations

---

## 2. Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant API Gateway
    participant Auth Service
    participant Keycloak/OIDC
    participant App Backend

    Client->>API Gateway: POST /auth/login (email, password)
    API Gateway->>Auth Service: Forward credentials
    Auth Service->>Keycloak/OIDC: Validate credentials
    Keycloak/OIDC-->>Auth Service: Access token + Refresh token
    Auth Service-->>API Gateway: JWT (15min) + Refresh (7d)
    API Gateway-->>Client: Set HttpOnly cookie + response body

    Note over Client,App Backend: Subsequent requests
    Client->>API Gateway: GET /api/v1/layers (Authorization: Bearer JWT)
    API Gateway->>API Gateway: Validate JWT signature & expiry
    API Gateway->>App Backend: Forward with X-User-Id header
    App Backend->>App Backend: Check layer permissions
    App Backend-->>API Gateway: Response
    API Gateway-->>Client: Layer data
```

---

## 3. Role-Based Access Control (RBAC)

```mermaid
flowchart TD
    subgraph Roles
        ADMIN[Administrator]
        ANALYST[GIS Analyst]
        FIELD[Field Personnel]
        VIEWER[Viewer]
    end

    subgraph Permissions
        VIEW[view]
        EDIT[edit]
        DELETE[delete]
        EXPORT[export]
        MANAGE[manage]
    end

    ADMIN --> VIEW
    ADMIN --> EDIT
    ADMIN --> DELETE
    ADMIN --> EXPORT
    ADMIN --> MANAGE

    ANALYST --> VIEW
    ANALYST --> EDIT
    ANALYST --> DELETE
    ANALYST --> EXPORT

    FIELD --> VIEW
    FIELD --> EDIT

    VIEWER --> VIEW
```

### 3.1 Permission Matrix

| Operation            | Admin | Analyst | Field | Viewer |
| -------------------- | :---: | :-----: | :---: | :----: |
| View map             |  ✅   |   ✅    |  ✅   |   ✅   |
| View layer list      |  ✅   |   ✅    |  ✅   |   ✅   |
| View feature details |  ✅   |   ✅    |  ✅   |   ✅   |
| Create feature       |  ✅   |   ✅    |  ✅   |   ❌   |
| Edit own features    |  ✅   |   ✅    |  ✅   |   ❌   |
| Edit any feature     |  ✅   |   ✅    |  ❌   |   ❌   |
| Delete feature       |  ✅   |   ✅    |  ❌   |   ❌   |
| Export data          |  ✅   |   ✅    |  ✅   |   ✅*  |
| Run analysis         |  ✅   |   ✅    |  ❌   |   ❌   |
| Create layers        |  ✅   |   ✅    |  ❌   |   ❌   |
| Manage permissions   |  ✅   |   ❌    |  ❌   |   ❌   |
| View audit logs      |  ✅   |   ❌    |  ❌   |   ❌   |
| System config        |  ✅   |   ❌    |  ❌   |   ❌   |

*Viewer export limited to CSV of visible features in public layers.

---

## 4. API Security

| Measure                  | Implementation                                                  |
| ------------------------ | --------------------------------------------------------------- |
| **Rate Limiting**        | Laravel throttle middleware per endpoint group + user tier       |
| **Input Validation**     | Laravel Form Requests with custom geometry validation rules      |
| **SQL Injection**        | Eloquent ORM with parameterised queries for all spatial SQL      |
| **CSRF**                 | SameSite=Strict cookies + XSRF-TOKEN for web, API tokens for SPA |
| **CORS**                 | Whitelist of approved origins                                   |
| **Request Signing**      | HMAC-SHA256 for server-to-server integrations                    |
| **Idempotency**          | Idempotency-Key header on POST/PATCH (prevent duplicate imports) |
| **Payload Size Limit**   | 50MB upload limit, streamed to object store                      |

---

## 5. Data Security

```mermaid
flowchart LR
    subgraph "Data Classifications"
        PUBLIC[Public - Basemaps, Published Maps]
        INTERNAL[Internal - Operational Layers]
        CONFIDENTIAL[Confidential - Asset Data]
        RESTRICTED[Restricted - Security Critical Infrastructure]
    end

    subgraph "Controls"
        C1[Encrypted at rest<br>AES-256]
        C2[Column-level encryption<br>for PII in properties]
        C3[Row-level security<br>PostgreSQL RLS]
        C4[Audit logging<br>all reads & writes]
        C5[Data masking<br>in viewer role]
    end

    PUBLIC --> C1
    INTERNAL --> C1
    INTERNAL --> C4
    CONFIDENTIAL --> C1
    CONFIDENTIAL --> C2
    CONFIDENTIAL --> C3
    CONFIDENTIAL --> C4
    RESTRICTED --> C1
    RESTRICTED --> C2
    RESTRICTED --> C3
    RESTRICTED --> C4
    RESTRICTED --> C5
```

### 5.1 PostgreSQL Row-Level Security

```sql
-- Enable RLS on features table
ALTER TABLE gis.features ENABLE ROW LEVEL SECURITY;

-- Viewer: can only see non-deleted features in visible layers
CREATE POLICY viewer_select ON gis.features FOR SELECT TO viewer_role
USING (
    deleted_at IS NULL
    AND layer_id IN (
        SELECT layer_id FROM gis.layer_permissions
        WHERE permissions @> ARRAY['view']
        AND (user_id = current_user_id() OR role_id IN (SELECT role_id FROM user_roles))
    )
);

-- Field Personnel: can see + edit own features, and edit any feature in assigned layers
CREATE POLICY field_update ON gis.features FOR UPDATE TO field_role
USING (
    deleted_at IS NULL
    AND layer_id IN (SELECT layer_id FROM gis.layer_permissions WHERE permissions @> ARRAY['edit'])
)
WITH CHECK (
    created_by = current_user_id()
    OR layer_id IN (SELECT layer_id FROM gis.layer_permissions WHERE permissions @> ARRAY['edit'])
);
```

---

## 6. Network Security

```mermaid
graph TD
    subgraph "Internet"
        CDN[CloudFront / Cloudflare CDN]
        WAF[AWS WAF / ModSecurity]
    end

    subgraph "VPC / Private Network"
        subgraph "Public Subnet"
            ALB[Application Load Balancer]
            GW[API Gateway]
        end
        subgraph "Private Subnet"
            WEB[Web Servers]
            API[API Containers]
            WS[WebSocket Servers]
        end
        subgraph "Data Subnet"
            PG[(PostGIS)]
            RC[(Redis)]
            ES[(Elasticsearch)]
        end
        subgraph "Management Subnet"
            BASTION[Bastion Host]
            VPN[VPN Gateway]
        end
    end

    CDN --> WAF
    WAF --> ALB
    ALB --> WEB
    ALB --> API
    ALB --> WS
    API --> PG
    API --> RC
    API --> ES
    WS --> RC
    BASTION --> PG
    BASTION --> RC
    VPN --> BASTION
```

---

## 7. Security Monitoring & Incident Response

| Area                   | Tool / Implementation                                         |
| ---------------------- | ------------------------------------------------------------- |
| **WAF**                | AWS WAF / Cloudflare — block SQLi, XSS, DDoS                  |
| **IDS/IPS**            | Snort / Suricata — network-level threat detection              |
| **SIEM**              | Wazuh / ELK Stack — log aggregation, alerting                 |
| **Vulnerability Scan** | Trivy (containers), OWASP ZAP (web app), Lynis (hosts)        |
| **Secrets Management** | HashiCorp Vault / AWS Secrets Manager                         |
| **Container Security** | Docker content trust, image signing, runtime security (Falco) |
| **Backup & DR**        | pgBackRest (WAL archiving), cross-region replication           |
| **Incident Response**  | On-call rotation, runbooks, post-mortem process                |

---

## 8. Compliance Considerations

| Requirement | Implementation |
| ----------- | -------------- |
| GDPR        | Data classification, PII masking, right-to-erasure API, consent management |
| ISO 27001   | Access control policy, change management, incident management |
| SOC 2       | Audit logging, encryption, availability monitoring, penetration testing |
| Local GIS Laws | CRS standards (EPSG:4326), metadata standards (ISO 19115), data sovereignty controls |
