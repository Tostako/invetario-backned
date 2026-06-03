# Documentacion de Nuevos Endpoints para Frontend

Backend Express multitenant — Modulos Landing Page, Cotizador y Auditoria.

- **Base URL API:** `/api/v1`
- **Formato de respuesta exitosa:**
```json
{
  "success": true,
  "data": {},
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```
- **Formato de error:**
```json
{
  "success": false,
  "message": "Mensaje del error"
}
```
- **Autenticacion:** rutas protegidas usan header `Authorization: Bearer <token>`.
- **Roles:** `owner`, `admin`, `staff`, `customer`.
- **Tenant:** el `shop_id` viene dentro del JWT. El frontend no debe mandarlo en cada request.

---

## Division funcional de los nuevos modulos

### A. Landing Page (Admin)
Gestiona la cara publica de cada tienda. Solo `owner` y `admin` pueden modificar.

- Configurar textos, colores, SEO de la landing.
- Subir y gestionar imagenes (hero, logos, carrusel).
- Ver historial de cambios (audit logs).

### B. Cotizador (Customer / Arquitecto)
Los `customer` (arquitectos/constructores) usan esta herramienta.

- Crear y gestionar cotizaciones de proyectos.
- Configurar sus propios precios y datos de facturacion.
- Los `admin` pueden ver todas las cotizaciones de la tienda.

### C. Landing Page Publica (Sin auth)
El publico visita la landing de la tienda sin login.

- Leer configuracion del sitio.
- Ver imagenes de la landing.

---

## Fase 1: Site Config (Configuracion de Landing Page)

### 1.1 Listar Configs (Admin)
Lista todas las configuraciones key-value de la tienda.

- **URL:** `GET /api/v1/site-config`
- **Auth:** Requiere token. Roles: `owner`, `admin`.
- **Query params opcionales:**
  - `section` — filtrar por seccion (ej: `hero`, `about`, `theme`).
  - `is_active` — `true` o `false`.
  - `page`, `limit` — paginacion.
- **Respuesta esperada:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "section": "hero",
      "key": "title",
      "value": "Construye tu sueno con ELEMENT",
      "value_type": "text",
      "active": true,
      "updated_by": "uuid-admin",
      "created_at": "2026-06-01T00:00:00.000Z",
      "updated_at": "2026-06-02T00:00:00.000Z"
    }
  ],
  "meta": { "total": 1, "page": 1, "limit": 50, "totalPages": 1 }
}
```
- **Frontend:** usar para mostrar tabla de configuracion en el panel admin.

### 1.2 Crear Config (Admin)
Crea una nueva clave de configuracion.

- **URL:** `POST /api/v1/site-config`
- **Auth:** Requiere token. Roles: `owner`, `admin`.
- **Body (JSON):**
```json
{
  "section": "hero",
  "key": "subtitle",
  "value": "Cotizaciones profesionales en minutos",
  "value_type": "text",
  "active": true
}
```
- **value_type permitidos:** `text`, `markdown`, `image_url`, `color`, `json`, `boolean`.
- **Respuesta:** devuelve la config creada.
- **Errores comunes:**
  - `409` — `CONFIG_DUPLICADA` si ya existe `section+key` en la tienda.
- **Frontend:** formulario con dropdown de `section`, input de `key`, textarea de `value`, select de `value_type`.

### 1.3 Obtener una Config (Admin)

- **URL:** `GET /api/v1/site-config/:id`
- **Auth:** Requiere token. Roles: `owner`, `admin`.
- **Respuesta:** devuelve la config con todos sus campos.

### 1.4 Actualizar Config (Admin)

- **URL:** `PATCH /api/v1/site-config/:id`
- **Auth:** Requiere token. Roles: `owner`, `admin`.
- **Body (JSON):** campos opcionales.
```json
{
  "value": "Nuevo subtitulo actualizado",
  "value_type": "text",
  "active": true
}
```
- **Nota:** `section` y `key` NO se pueden cambiar. Solo `value`, `value_type`, `active`.
- **Respuesta:** devuelve la config actualizada.

### 1.5 Desactivar Config (Admin)
Soft delete (pone `active = false`).

- **URL:** `DELETE /api/v1/site-config/:id`
- **Auth:** Requiere token. Roles: `owner`, `admin`.
- **Respuesta:**
```json
{
  "success": true,
  "data": { "message": "Config deactivated successfully" }
}
```

### 1.6 Leer Config Publica (Sin auth)
El frontend de la landing page consume esto.

- **URL:** `GET /api/v1/public/site-config?shop_slug=mi-tienda`
- **Auth:** No requiere token.
- **Respuesta esperada:**
```json
{
  "success": true,
  "data": [
    { "section": "hero", "key": "title", "value": "Construye tu sueno", "value_type": "text" },
    { "section": "theme", "key": "primary_color", "value": "#b69462", "value_type": "color" }
  ]
}
```
- **Frontend:** al cargar la landing, agrupar por `section` y renderizar dinamicamente.

---

## Fase 2: Landing Images (Imagenes de la Landing Page)

### 2.1 Listar Imagenes (Admin)

- **URL:** `GET /api/v1/landing-images`
- **Auth:** Requiere token. Roles: `owner`, `admin`.
- **Query params opcionales:**
  - `type` — filtrar por tipo (`hero_bg`, `carousel`, `logo_main`, etc.).
  - `is_active` — `true` o `false`.
  - `page`, `limit` — paginacion.
- **Respuesta esperada:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "hero_bg",
      "url": "https://cdn.../hero-bg.webp",
      "alt": "Fondo hero principal",
      "order": 0,
      "active": true,
      "metadata": { "width": 1920, "height": 1080, "mimeType": "image/webp" },
      "uploaded_by": "uuid-admin",
      "created_at": "2026-06-01T00:00:00.000Z"
    }
  ],
  "meta": { "total": 1, "page": 1, "limit": 50, "totalPages": 1 }
}
```

### 2.2 Crear Imagen (Admin)
Registra una nueva imagen en la landing.

- **URL:** `POST /api/v1/landing-images`
- **Auth:** Requiere token. Roles: `owner`, `admin`.
- **Body (JSON):**
```json
{
  "type": "hero_bg",
  "url": "https://cdn.../hero-bg.webp",
  "alt": "Fondo hero",
  "order": 0,
  "active": true,
  "metadata": {
    "width": 1920,
    "height": 1080,
    "mimeType": "image/webp",
    "originalName": "hero-casa.webp"
  }
}
```
- **Tipos permitidos:** `hero_bg`, `carousel`, `logo_main`, `logo_white`, `logo_abbreviated`, `about`, `service_card`, `cta_bg`.
- **Respuesta:** devuelve la imagen registrada.
- **Frontend:** subir la imagen primero a Supabase Storage (o CDN), obtener la URL publica, y luego registrarla aqui.

### 2.3 Actualizar Imagen (Admin)

- **URL:** `PATCH /api/v1/landing-images/:id`
- **Auth:** Requiere token. Roles: `owner`, `admin`.
- **Body (JSON):** campos opcionales.
```json
{
  "url": "https://cdn.../nuevo-hero.webp",
  "alt": "Nueva descripcion",
  "order": 1,
  "active": true
}
```

### 2.4 Desactivar Imagen (Admin)

- **URL:** `DELETE /api/v1/landing-images/:id`
- **Auth:** Requiere token. Roles: `owner`, `admin`.
- **Respuesta:**
```json
{ "success": true, "data": { "message": "Image deactivated successfully" } }
```

### 2.5 Ver Imagenes Publicas (Sin auth)

- **URL:** `GET /api/v1/public/landing-images?shop_slug=mi-tienda`
- **Auth:** No requiere token.
- **Respuesta esperada:**
```json
{
  "success": true,
  "data": [
    {
      "type": "hero_bg",
      "url": "https://cdn.../hero-bg.webp",
      "alt": "Fondo hero",
      "order": 0,
      "metadata": { "width": 1920, "height": 1080 }
    }
  ]
}
```
- **Frontend:** usar en la landing page para mostrar hero, logos, carrusel, etc.

---

## Fase 3: Audit Logs (Auditoria de Cambios del Admin)

### 3.1 Listar Logs (Admin)
Registro inmutable de cambios hechos por el admin.

- **URL:** `GET /api/v1/audit-logs`
- **Auth:** Requiere token. Roles: `owner`, `admin`.
- **Query params opcionales:**
  - `entity` — filtrar por tabla (`SiteConfig`, `LandingImage`).
  - `user_id` — filtrar por admin que hizo el cambio.
  - `page`, `limit` — paginacion.
- **Respuesta esperada:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "action": "UPDATE_SITE_CONFIG",
      "entity": "SiteConfig",
      "entity_id": "uuid-config",
      "old_value": "{\"section\":\"hero\",\"key\":\"title\",\"value\":\"Viejo titulo\"}",
      "new_value": "{\"section\":\"hero\",\"key\":\"title\",\"value\":\"Nuevo titulo\"}",
      "user_id": "uuid-admin",
      "created_at": "2026-06-02T20:00:00.000Z"
    }
  ],
  "meta": { "total": 1, "page": 1, "limit": 50, "totalPages": 1 }
}
```
- **Frontend:** mostrar como tabla de historial en el panel admin.

---

## Fase 4: Quotes (Cotizaciones del Arquitecto/Customer)

### 4.1 Listar Cotizaciones
- **Customer:** ve solo las suyas.
- **Admin/Owner:** ve todas las de la tienda.

- **URL:** `GET /api/v1/quotes`
- **Auth:** Requiere token. Roles: `customer`, `admin`, `owner`.
- **Query params opcionales:**
  - `status` — `draft`, `sent`, `paid`, `completed`.
  - `page`, `limit` — paginacion.
- **Respuesta esperada:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "customer_id": "uuid-customer",
      "client": "Maria Garcia",
      "project": "Casa Campestre",
      "area": 250.5,
      "price": 17500000,
      "status": "draft",
      "data": {
        "areaMode": "dimensions",
        "lotShape": "rectangular",
        "occ": 80,
        "floors": 2,
        "selectedServices": ["arch", "struct"]
      },
      "date": "2026-06-02",
      "created_at": "2026-06-02T10:00:00.000Z",
      "updated_at": "2026-06-02T10:00:00.000Z"
    }
  ],
  "meta": { "total": 1, "page": 1, "limit": 20, "totalPages": 1 }
}
```

### 4.2 Crear Cotizacion (Customer)

- **URL:** `POST /api/v1/quotes`
- **Auth:** Requiere token. Rol: `customer`.
- **Body (JSON):**
```json
{
  "client": "Maria Garcia",
  "project": "Casa Campestre",
  "area": 250.5,
  "price": 17500000,
  "status": "draft",
  "data": {
    "areaMode": "dimensions",
    "lotShape": "rectangular",
    "frontal": "12",
    "posterior": "12",
    "latIzq": "10",
    "latDer": "10",
    "occ": 80,
    "floors": 2,
    "selectedServices": ["arch", "struct"],
    "hasCompletePackage": false,
    "discount": 0,
    "additionalServices": []
  },
  "date": "2026-06-02"
}
```
- **Respuesta:** devuelve la cotizacion creada.

### 4.3 Obtener una Cotizacion

- **URL:** `GET /api/v1/quotes/:id`
- **Auth:** Requiere token. Roles: `customer`, `admin`, `owner`.
- **Seguridad:** si es `customer`, solo puede ver la suya. Sino devuelve `403`.
- **Respuesta:** devuelve la cotizacion completa.

### 4.4 Actualizar Cotizacion (Customer)

- **URL:** `PATCH /api/v1/quotes/:id`
- **Auth:** Requiere token. Rol: `customer` (o admin).
- **Body (JSON):** campos opcionales.
```json
{
  "client": "Maria Garcia V2",
  "project": "Casa Campestre Actualizada",
  "area": 300,
  "price": 21000000,
  "status": "sent",
  "data": { "floors": 3 }
}
```
- **Seguridad:** `customer` solo puede editar las suyas.

### 4.5 Eliminar Cotizacion (Customer)

- **URL:** `DELETE /api/v1/quotes/:id`
- **Auth:** Requiere token. Rol: `customer` (o admin).
- **Respuesta:**
```json
{ "success": true, "data": { "message": "Quote deleted successfully" } }
```
- **Nota:** es hard delete (se borra definitivamente).

---

## Fase 5: Customer Config (Configuracion de Precios por Arquitecto)

### 5.1 Ver Mi Config (Customer)
Cada arquitecto tiene exactamente UNA configuracion.

- **URL:** `GET /api/v1/customer-config/me`
- **Auth:** Requiere token. Rol: `customer`.
- **Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "customer_id": "uuid-customer",
    "services": {
      "arch": { "price": 7000, "unit": "/m2" },
      "struct": { "price": 5000, "unit": "/m2" }
    },
    "sub_packages": {},
    "complete_package": {},
    "payment_plan": {
      "initial": 30,
      "installments": 6
    },
    "invoice": {
      "company": "Constructora XYZ",
      "nit": "123456789",
      "bank": "Bancolombia",
      "account": "123-456789"
    },
    "estimation": {
      "obra_negra": 2500000,
      "obra_gris": 1800000,
      "acabados": 3200000
    },
    "created_at": "2026-06-01T00:00:00.000Z",
    "updated_at": "2026-06-02T00:00:00.000Z"
  }
}
```
- **Frontend:** si devuelve `404`, el arquitecto aun no tiene config. Mostrar formulario para crearla.

### 5.2 Crear / Actualizar Mi Config (Customer)
Upsert: crea si no existe, actualiza si existe.

- **URL:** `PUT /api/v1/customer-config/me`
- **Auth:** Requiere token. Rol: `customer`.
- **Body (JSON):** todos los campos son opcionales. Campos no enviados se preservan.
```json
{
  "services": {
    "arch": { "price": 7500, "unit": "/m2" },
    "struct": { "price": 5200, "unit": "/m2" }
  },
  "invoice": {
    "company": "Constructora XYZ S.A.S.",
    "nit": "123456789-0"
  }
}
```
- **Respuesta:** devuelve la config completa (merge de lo existente + lo nuevo).
- **Frontend:** formulario con secciones: Servicios, Plan de Pagos, Datos de Facturacion, Estimaciones.

### 5.3 Listar Todas las Configs (Admin)

- **URL:** `GET /api/v1/customer-config`
- **Auth:** Requiere token. Roles: `owner`, `admin`.
- **Query params:** `page`, `limit`.
- **Respuesta:** lista de configs de todos los customers de la tienda.

### 5.4 Ver Config de un Customer (Admin)

- **URL:** `GET /api/v1/customer-config/:id`
- **Auth:** Requiere token. Roles: `owner`, `admin`.
- **Respuesta:** config completa de un customer especifico.

### 5.5 Eliminar Config de un Customer (Admin)

- **URL:** `DELETE /api/v1/customer-config/:id`
- **Auth:** Requiere token. Roles: `owner`, `admin`.
- **Respuesta:**
```json
{ "success": true, "data": { "message": "Customer config deleted successfully" } }
```

---

## Resumen de Endpoints Nuevos

| Metodo | Endpoint | Auth | Rol | Descripcion |
|--------|----------|------|-----|-------------|
| GET    | `/api/v1/site-config` | JWT | admin/owner | Listar configs |
| POST   | `/api/v1/site-config` | JWT | admin/owner | Crear config |
| GET    | `/api/v1/site-config/:id` | JWT | admin/owner | Ver config |
| PATCH  | `/api/v1/site-config/:id` | JWT | admin/owner | Actualizar config |
| DELETE | `/api/v1/site-config/:id` | JWT | admin/owner | Desactivar config |
| GET    | `/api/v1/public/site-config` | — | publico | Leer configs activas |
| GET    | `/api/v1/landing-images` | JWT | admin/owner | Listar imagenes |
| POST   | `/api/v1/landing-images` | JWT | admin/owner | Registrar imagen |
| GET    | `/api/v1/landing-images/:id` | JWT | admin/owner | Ver imagen |
| PATCH  | `/api/v1/landing-images/:id` | JWT | admin/owner | Actualizar imagen |
| DELETE | `/api/v1/landing-images/:id` | JWT | admin/owner | Desactivar imagen |
| GET    | `/api/v1/public/landing-images` | — | publico | Ver imagenes activas |
| GET    | `/api/v1/audit-logs` | JWT | admin/owner | Listar auditoria |
| GET    | `/api/v1/audit-logs/:id` | JWT | admin/owner | Ver log |
| GET    | `/api/v1/quotes` | JWT | customer/admin/owner | Listar cotizaciones |
| POST   | `/api/v1/quotes` | JWT | customer | Crear cotizacion |
| GET    | `/api/v1/quotes/:id` | JWT | customer/admin/owner | Ver cotizacion |
| PATCH  | `/api/v1/quotes/:id` | JWT | customer/admin/owner | Actualizar cotizacion |
| DELETE | `/api/v1/quotes/:id` | JWT | customer/admin/owner | Eliminar cotizacion |
| GET    | `/api/v1/customer-config/me` | JWT | customer | Ver mi config |
| PUT    | `/api/v1/customer-config/me` | JWT | customer | Crear/actualizar mi config |
| GET    | `/api/v1/customer-config` | JWT | admin/owner | Listar todas las configs |
| GET    | `/api/v1/customer-config/:id` | JWT | admin/owner | Ver config de customer |
| DELETE | `/api/v1/customer-config/:id` | JWT | admin/owner | Eliminar config |

---

*Ultima actualizacion: Junio 2026*
