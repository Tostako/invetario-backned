# 📋 Documentación de la Base de Datos — ELEMENT Cotizador

> **Sistema:** ELEMENT Cotizador Profesional (modo Tienda + Admin)  
> **Motor:** SQLite (desarrollo) / PostgreSQL (producción futura)   
> **Última actualización:** Junio 2026

---

## Índice

1. [Resumen General](#1-resumen-general)
2. [Diagrama Entidad-Relación Completo](#2-diagrama-entidad-relación-completo)
3. [Tablas Detalladas](#3-tablas-detalladas)
   - 3.1 `users`
   - 3.2 `quotes`
   - 3.3 `user_configs`
   - 3.4 `site_configs`
   - 3.5 `landing_images`
   - 3.6 `service_catalog`
   - 3.7 `audit_logs`
4. [Arquitectura de Roles: Admin vs Usuario](#4-arquitectura-de-roles-admin-vs-usuario)
5. [Política de Aislamiento](#5-política-de-aislamiento)
6. [Seguridad](#6-seguridad)
7. [Integración con SaaS Externo](#7-integración-con-saas-externo)
   - 7.1 Autenticación Delegada
   - 7.2 Gestión de Imágenes (Landing Page)
   - 7.3 Sincronización de Usuarios
8. [Flujos de Datos](#8-flujos-de-datos)
   - 8.1 Flujo de Guardado de Cotización
   - 8.2 Flujo de Generación de Cuenta de Cobro
   - 8.3 Flujo de Subida de Imagen por Admin
   - 8.4 Flujo de Actualización de Landing por Admin
9. [Migraciones](#9-migraciones)
10. [Schema Prisma](#10-schema-prisma)
11. [Rutas API](#11-rutas-api)
12. [Notas de Implementación y Lecciones Aprendidas](#12-notas-de-implementación-y-lecciones-aprendidas)

---

## 1. Resumen General

La base de datos soporta **dos mundos** dentro de la misma aplicación:

| Mundo | Actor | Qué gestiona |
|-------|-------|-------------|
| **Tienda Pública** | Admin (1 persona)(que seria el saas) | Landing page, imágenes, catálogo de servicios, textos del sitio |
| **Cotizador Privado** | Usuarios (arquitectos/constructores)(customers) | Sus cotizaciones, configuración de precios, clientes |

**Aislamiento total:** Cada usuario ve solo sus cotizaciones. El admin ve y modifica la tienda. **Ningún dato de cotización se comparte entre usuarios.**

### Tablas principales

| Tabla | Propósito | Registros |
|-------|-----------|-----------|
| `users` | Cuentas de usuario (autenticación) | N (ilimitado) |
| `quotes` | Cotizaciones generadas por usuarios | N por usuario |
| `user_configs` | Configuración personalizada de precios por usuario | 1 por usuario |
| `site_configs` | Configuración global del sitio (landing) | N (claves de config) |
| `landing_images` | Imágenes de la landing page | N (hero, carrusel, logos) |
| `service_catalog` | Catálogo de servicios públicos (vitrina) | N (gestionado por admin) |
| `audit_logs` | Trazabilidad de cambios del admin | N (ilimitado) |

---

## 2. Diagrama Entidad-Relación Completo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              MUNDO PÚBLICO (TIENDA)                         │
│  ┌──────────────┐    ┌──────────────────┐    ┌──────────────────────────┐   │
│  │ site_configs │    │  landing_images  │    │    service_catalog       │   │
│  ├──────────────┤    ├──────────────────┤    ├──────────────────────────┤   │
│  │ id (PK)      │    │ id (PK)          │    │ id (PK)                  │   │
│  │ section      │    │ type             │    │ name                     │   │
│  │ key (UQ)     │    │ url              │    │ slug (UQ)                │   │
│  │ value        │    │ alt              │    │ description              │   │
│  │ valueType    │    │ order            │    │ price                    │   │
│  │ active       │    │ active           │    │ priceUnit                │   │
│  │ updatedBy    │    │ metadata (JSON)  │    │ imageUrl                 │   │
│  └──────────────┘    │ uploadedBy       │    │ category                 │   │
│                      └──────────────────┘    │ active                   │   │
│                                             │ displayOrder             │   │
│                                             └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │ gestiona (role = "admin")
                                    │
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MUNDO PRIVADO (COTIZADOR)                         │
│                                                                             │
│   ┌─────────────┐         ┌─────────────┐         ┌─────────────────┐    │
│   │    users    │         │   quotes    │         │   user_configs    │    │
│   ├─────────────┤         ├─────────────┤         ├─────────────────┤    │
│   │ id (PK)     │◄────────┤ id (PK)     │         │ id (PK)         │    │
│   │ name        │  1    N │ client      │         │ services (JSON) │    │
│   │ email (UQ)  │         │ project     │         │ subPackages     │    │
│   │ username(UQ)│         │ area        │         │ completePackage │    │
│   │ password    │◄────────┤ user_id(FK) │         │ paymentPlan     │    │
│   │ role        │  1    1 │ status      │         │ invoice (JSON)  │    │
│   │ created_at  │         │ data        │         │ estimation      │    │
│   │ updated_at  │         │ date        │         │ user_id (FK,UQ) │    │
│   └─────────────┘         │ created_at  │         │ created_at      │    │
│                           │ updated_at  │         │ updated_at      │    │
│                           └─────────────┘         └─────────────────┘    │
│                                   ▲                                        │
│                                   │                                        │
│                           ┌───────────────┐                                │
│                           │  audit_logs   │                                │
│                           ├───────────────┤                                │
│                           │ id (PK)       │                                │
│                           │ action        │                                │
│                           │ entity        │                                │
│                           │ entityId      │                                │
│                           │ oldValue      │                                │
│                           │ newValue      │                                │
│                           │ user_id (FK)  │────────────────────────────────│
│                           │ created_at    │                                │
│                           └───────────────┘                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Tablas Detalladas

---

### 3.1 `users`

Almacena las cuentas de usuario. Cada persona que usa el sistema tiene exactamente un registro aquí. Ahora incluye **rol** para distinguir admin de usuario normal.

| Atributo | Tipo | Constraints | Descripción |
|----------|------|-------------|-------------|
| `id` | `String` | PK, UUID v4 | Identificador único universal |
| `name` | `String` | NOT NULL | Nombre completo (ej: "Juan Pérez") |
| `email` | `String` | NOT NULL, **UNIQUE** | Correo electrónico |
| `username` | `String` | NOT NULL, **UNIQUE** | Nombre de usuario para login |
| `password` | `String` | NOT NULL | Hash bcrypt (10 rounds). **En modo SaaS externo, este campo puede quedar vacío o con un placeholder** |
| `role` | `String` | DEFAULT `"user"` | `"user"` (arquitecto) o `"admin"` (gestor de la tienda) |
| `created_at` | `DateTime` | DEFAULT `now()` | Fecha de registro |
| `updated_at` | `DateTime` | AUTO `updatedAt` | Última modificación |

**Relaciones:**
- Tiene muchas `quotes` (1 → N)
- Tiene una `user_config` opcional (1 → 0..1)
- Tiene muchos `audit_logs` (1 → N) cuando actúa como admin

**Nota sobre autenticación futura (SaaS externo):**
Si se delega el login a un SaaS externo, esta tabla puede sincronizarse vía webhook. El `password` podría almacenar un hash local para fallback, o un token de servicio. Ver [sección 7](#7-integración-con-saas-externo).

---

### 3.2 `quotes`

Cada cotización que un usuario genera y guarda queda registrada aquí. Es la tabla más dinámica del sistema.

| Atributo | Tipo | Constraints | Descripción |
|----------|------|-------------|-------------|
| `id` | `Int` | PK, autoincremental | Número consecutivo de la cotización |
| `client` | `String` | NOT NULL | Nombre del cliente |
| `project` | `String` | NOT NULL | Nombre del proyecto |
| `area` | `Float` | NOT NULL | Área total calculada en m² |
| `price` | `Float` | NOT NULL | Precio final calculado en COP |
| `status` | `String` | DEFAULT `"draft"` | `draft`, `sent`, `paid`, `completed` |
| `data` | `String` | NOT NULL | **JSON stringificado** con todos los datos del formulario |
| `date` | `String` | NOT NULL | Fecha visible para el usuario (formato local es-CO) |
| `user_id` | `String` | NOT NULL, FK → `users.id` | Dueño de la cotización |
| `created_at` | `DateTime` | DEFAULT `now()` | Fecha de creación real |
| `updated_at` | `DateTime` | AUTO `updatedAt` | Última modificación |

**Nota sobre `data`:**
Este campo almacena un string JSON con toda la información del wizard de cotización. Estructura típica:

```json
{
  "client": "María García",
  "project": "Casa Campestre",
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
}
```

**Relaciones:**
- Pertenece a un `user` (N → 1)
- Si el usuario se elimina, todas sus cotizaciones se borran en cascada

---

### 3.3 `user_configs`

Configuración personalizada de cada usuario. Se crea automáticamente la primera vez que el usuario accede a Ajustes. Cada usuario tiene **exactamente una** configuración.

| Atributo | Tipo | Constraints | Descripción |
|----------|------|-------------|-------------|
| `id` | `Int` | PK, autoincremental | ID interno |
| `services` | `String` | DEFAULT `"{}"` | **JSON** con servicios y precios personalizados |
| `subPackages` | `String` | DEFAULT `"{}"` | **JSON** con sub-paquetes |
| `completePackage` | `String` | DEFAULT `"{}"` | **JSON** con paquete completo |
| `paymentPlan` | `String` | DEFAULT `"{}"` | **JSON** con plan de pagos |
| `invoice` | `String` | DEFAULT `"{}"` | **JSON** con datos de empresa, representante, bancarios |
| `estimation` | `String` | DEFAULT `"{}"` | **JSON** con precios de obra negra, gris, acabados |
| `user_id` | `String` | NOT NULL, **UNIQUE**, FK → `users.id` | Dueño |
| `created_at` | `DateTime` | DEFAULT `now()` | Fecha de creación |
| `updated_at` | `DateTime` | AUTO `updatedAt` | Última modificación |

**Relaciones:**
- Pertenece a un `user` (1 → 1)
- Si el usuario se elimina, su configuración se borra en cascada

---

### 3.4 `site_configs` — Configuración Global del Sitio

**Propósito:** Permitir al administrador modificar textos, colores, SEO y comportamiento de la landing page **sin tocar código**. Todo es clave-valor con tipado.

| Atributo | Tipo | Constraints | Descripción |
|----------|------|-------------|-------------|
| `id` | `Int` | PK, autoincremental | ID interno |
| `section` | `String` | NOT NULL | Sección de la landing: `hero`, `about`, `services`, `footer`, `seo`, `theme` |
| `key` | `String` | NOT NULL, parte de UK | Clave dentro de la sección: `title`, `subtitle`, `primary_color`, `cta_text` |
| `value` | `String` | NOT NULL | El contenido o valor almacenado |
| `valueType` | `String` | DEFAULT `"text"` | Tipo del valor: `text`, `markdown`, `image_url`, `color`, `json`, `boolean` |
| `active` | `Boolean` | DEFAULT `true` | Si esta configuración está activa |
| `updated_by` | `String` | FK opcional → `users.id` | Admin que hizo la última modificación |
| `updated_at` | `DateTime` | AUTO `updatedAt` | Última modificación |
| `created_at` | `DateTime` | DEFAULT `now()` | Fecha de creación |

**Constraint única compuesta:** `@@unique([section, key])` → no puede haber dos claves iguales en la misma sección.

**Ejemplos de registros:**

| section | key | value | valueType |
|---------|-----|-------|-----------|
| `hero` | `title` | `Construye tu sueño con ELEMENT` | `text` |
| `hero` | `subtitle` | `Cotizaciones profesionales en minutos` | `text` |
| `hero` | `background_image` | `https://cdn.elemen.../hero-bg.jpg` | `image_url` |
| `theme` | `primary_color` | `#b69462` | `color` |
| `seo` | `meta_description` | `ELEMENT es la plataforma...` | `text` |
| `footer` | `contact_email` | `hola@elementhaus.com` | `text` |
| `about` | `content` | `## Quiénes somos\n\nELEMENT nació...` | `markdown` |

**Frontend:** Al cargar la landing, el frontend hace `GET /api/site-config` y recibe un objeto agrupado por secciones que renderiza dinámicamente.

---

### 3.5 `landing_images` — Imágenes de la Landing Page

**Propósito:** Almacenar las URLs y metadatos de todas las imágenes que el admin sube para la landing page (hero, carrusel, logos, secciones, etc.). Las imágenes reales residen en un **SaaS/CDN externo**; aquí solo guardamos la referencia.

| Atributo | Tipo | Constraints | Descripción |
|----------|------|-------------|-------------|
| `id` | `Int` | PK, autoincremental | ID interno |
| `type` | `String` | NOT NULL | Tipo de imagen: `hero_bg`, `carousel`, `logo_main`, `logo_white`, `logo_abbreviated`, `about`, `service_card`, `cta_bg` |
| `url` | `String` | NOT NULL | URL pública del CDN/SaaS donde está alojada la imagen |
| `alt` | `String` | nullable | Texto alternativo (accesibilidad y SEO) |
| `order` | `Int` | DEFAULT `0` | Orden de aparición (para carruseles y galerías) |
| `active` | `Boolean` | DEFAULT `true` | Si la imagen está visible en la landing |
| `metadata` | `String` | nullable, JSON | Metadatos técnicos del archivo: `{ provider, publicId, width, height, mimeType, originalName }` |
| `uploaded_by` | `String` | FK opcional → `users.id` | Admin que subió la imagen |
| `created_at` | `DateTime` | DEFAULT `now()` | Fecha de subida |
| `updated_at` | `DateTime` | AUTO `updatedAt` | Última modificación |

**Tipos de imagen (`type`) detallados:**

| type | Uso | Cantidad esperada |
|------|-----|-------------------|
| `hero_bg` | Fondo del hero principal | 1 (o múltiples si hay carrusel de heroes) |
| `carousel` | Imágenes del carrusel de la landing | N (ordenadas por `order`) |
| `logo_main` | Logo principal con banner (dorado/original) | 1 |
| `logo_white` | Logo abreviado blanco (navbar, login) | 1 |
| `logo_abbreviated` | Logo abreviado dorado (navbar dark) | 1 |
| `about` | Imagen de la sección "Nosotros" | 1-2 |
| `service_card` | Imagen de fondo o icono para tarjeta de servicio | N |
| `cta_bg` | Fondo de la sección "Call to Action" | 1 |

**Metadatos (`metadata`) típicos cuando el SaaS externo es el origen:**

```json
{
  "provider": "saas-imagenes-propio",
  "publicId": "element/landing/hero-bg-v3",
  "width": 1920,
  "height": 1080,
  "mimeType": "image/webp",
  "originalName": "hero-casa-campestre.webp",
  "saasImageId": "img_abc123xyz"
}
```

**Nota:** El campo `metadata` es clave para la integración con el SaaS externo. Si el admin quiere reemplazar una imagen, usa el `publicId` o `saasImageId` para solicitar la eliminación al SaaS, y luego inserta la nueva URL.

---

### 3.6 `service_catalog` — Catálogo de Servicios Públicos

**Propósito:** Vitrina pública de servicios que ELEMENT ofrece. El admin crea, edita y activa servicios aquí. Los usuarios normales **no** pueden modificar este catálogo, pero pueden usarlo como plantilla al crear sus propios servicios en `user_configs.services`.

| Atributo | Tipo | Constraints | Descripción |
|----------|------|-------------|-------------|
| `id` | `Int` | PK, autoincremental | ID interno |
| `name` | `String` | NOT NULL | Nombre del servicio: "Diseño Arquitectónico" |
| `slug` | `String` | **UNIQUE** | URL amigable: `diseno-arquitectonico` |
| `description` | `String` | nullable | Descripción larga (admite markdown/HTML) |
| `short_description` | `String` | nullable | Línea corta para tarjetas: "Planos 2D, 3D y renders" |
| `price` | `Float` | nullable | Precio base. `null` = "Consultar" |
| `price_unit` | `String` | DEFAULT `"/m²"` | Unidad: `/m²`, `fijo`, `desde`, `consultar` |
| `image_url` | `String` | nullable | URL de la imagen de portada del servicio |
| `category` | `String` | DEFAULT `"general"` | Categoría: `diseno`, `estructuras`, `acabados`, `instalaciones`, `paquetes` |
| `features` | `String` | nullable, JSON | Array de características: `["Planos", "Renders 3D", "Licencias"]` |
| `active` | `Boolean` | DEFAULT `true` | Si el servicio aparece en la tienda |
| `display_order` | `Int` | DEFAULT `0` | Orden de aparición en la lista de servicios |
| `created_at` | `DateTime` | DEFAULT `now()` | Fecha de creación |
| `updated_at` | `DateTime` | AUTO `updatedAt` | Última modificación |
| `created_by` | `String` | FK opcional → `users.id` | Admin que creó el servicio |

**Ejemplo de registro:**

```json
{
  "name": "Diseño Arquitectónico Completo",
  "slug": "diseno-arquitectonico-completo",
  "shortDescription": "Desde el concepto hasta los planos de construcción",
  "price": 7000,
  "priceUnit": "/m²",
  "imageUrl": "https://cdn.../servicio-diseno.webp",
  "category": "diseno",
  "features": ["Planta arquitectónica", "Cortes y elevaciones", "Renders 3D", "Especificaciones técnicas"],
  "active": true,
  "displayOrder": 1
}
```

**Relación con el cotizador privado:**
Cuando un usuario arquitecto ve este catálogo, puede hacer clic en "Usar en mi cotización" y el sistema copia los datos del servicio a su `user_configs.services` con un nuevo ID local.

---

### 3.7 `audit_logs` — Trazabilidad de Cambios del Admin

**Propósito:** Registrar **quién hizo qué, cuándo y qué cambió** en la tienda. Es esencial para un sistema con admin único/multiple donde los cambios afectan la cara pública del negocio.

| Atributo | Tipo | Constraints | Descripción |
|----------|------|-------------|-------------|
| `id` | `Int` | PK, autoincremental | ID interno |
| `action` | `String` | NOT NULL | Tipo de acción: `UPDATE_SITE_CONFIG`, `UPLOAD_IMAGE`, `DELETE_IMAGE`, `CREATE_SERVICE`, `UPDATE_SERVICE`, `DELETE_SERVICE`, `TOGGLE_SERVICE`, `UPDATE_THEME` |
| `entity` | `String` | NOT NULL | Tabla afectada: `SiteConfig`, `LandingImage`, `ServiceCatalog` |
| `entity_id` | `String` | nullable | ID del registro afectado |
| `old_value` | `String` | nullable, JSON | Snapshot del objeto **antes** del cambio |
| `new_value` | `String` | nullable, JSON | Snapshot del objeto **después** del cambio |
| `user_id` | `String` | NOT NULL, FK → `users.id` | Admin que ejecutó la acción |
| `created_at` | `DateTime` | DEFAULT `now()` | Fecha y hora exacta del cambio |

**Ejemplo de registro:**

```json
{
  "action": "UPDATE_SITE_CONFIG",
  "entity": "SiteConfig",
  "entityId": "42",
  "oldValue": "{\"section\":\"hero\",\"key\":\"title\",\"value\":\"Construye tu sueño\"}",
  "newValue": "{\"section\":\"hero\",\"key\":\"title\",\"value\":\"Diseña tu hogar ideal con ELEMENT\"}",
  "userId": "admin-uuid-123",
  "createdAt": "2026-06-02T20:00:00Z"
}
```

**Relaciones:**
- Pertenece a un `user` (admin) que ejecutó la acción
- No tiene cascade delete (los logs se conservan incluso si el admin se elimina)

---

## 4. Arquitectura de Roles: Admin vs Usuario

```
┌─────────────────────────────────────────────────────────────┐
│                         ADMIN (role = "admin")              │
│                                                             │
│  Dashboard Admin                                            │
│    ├── Gestión de Landing (site_configs)                    │
│    │     └── Editar textos, colores, SEO, CTA               │
│    ├── Gestión de Imágenes (landing_images)                 │
│    │     └── Subir/reemplazar/eliminar fotos y logos        │
│    ├── Catálogo de Servicios (service_catalog)              │
│    │     └── Crear, editar, activar/desactivar servicios    │
│    ├── Auditoría (audit_logs)                               │
│    │     └── Ver historial de cambios                       │
│    └── (Futuro) Gestión de Usuarios                         │
│                                                             │
│  Acceso: /admin/*                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ mismo backend, mismas tablas
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        USUARIO (role = "user")              │
│                                                             │
│  Cotizador Privado                                          │
│    ├── Crear cotización (quotes)                            │
│    ├── Ver historial (quotes)                               │
│    ├── Generar cuenta de cobro (quotes + user_configs)      │
│    ├── Configurar precios (user_configs)                    │
│    └── Configurar empresa (user_configs.invoice)            │
│                                                             │
│  Acceso: /dashboard, /quote, /history, /settings            │
└─────────────────────────────────────────────────────────────┘
```

**Reglas de autorización:**

| Acción | Admin | Usuario |
|--------|-------|---------|
| Modificar landing | ✅ | ❌ |
| Subir imágenes | ✅ | ❌ |
| Gestionar catálogo de servicios | ✅ | ❌ |
| Ver audit logs | ✅ | ❌ |
| Crear cotización | ❌ | ✅ |
| Ver sus cotizaciones | ❌ | ✅ (solo las suyas) |
| Modificar sus precios | ❌ | ✅ (solo los suyos) |
| Ver catálogo de servicios | ✅ | ✅ (solo lectura) |

---

## 5. Política de Aislamiento

```
Usuario A (role = "user")              Usuario B (role = "user")
   │                                        │
   ├─ quotes [Cotización 1]                 ├─ quotes [Cotización X]
   ├─ quotes [Cotización 2]                 ├─ quotes [Cotización Y]
   └─ user_config [Config A]                └─ user_config [Config B]
                                                   
Admin (role = "admin")
   │
   ├─ site_configs [Config global]
   ├─ landing_images [Todas las imágenes]
   ├─ service_catalog [Todos los servicios públicos]
   └─ audit_logs [Todos los cambios]
```

- El backend usa **JWT** + `role` para autorizar rutas de admin.
- Las rutas `/api/admin/*` verifican `req.user.role === 'admin'`.
- Las consultas a `quotes` y `user_configs` siempre incluyen `WHERE userId = ?`.
- Las consultas a `site_configs`, `landing_images`, `service_catalog` no filtran por usuario (son globales).

---

## 6. Seguridad

| Aspecto | Implementación |
|---------|---------------|
| Contraseñas | Hash con **bcrypt** (10 salt rounds). Nunca texto plano |
| Autenticación | Tokens **JWT** con expiración de 7 días |
| Autorización por rol | Middleware `adminMiddleware` verifica `role === 'admin'` |
| Autorización por recurso | Middleware `authMiddleware` + `WHERE userId = ?` en queries |
| SQL Injection | Protegido por Prisma ORM (queries parametrizadas) |
| XSS | Escapado automático en el frontend (React) |
| Audit | Todos los cambios del admin se registran en `audit_logs` |

---

## 7. Integración con SaaS Externo

> **Contexto:** El propietario de ELEMENT tiene un SaaS propio que quiere usar para:
> > 1. Almacenar imágenes (CDN)
> > 2. Gestionar autenticación (login/register de usuarios)

Esta sección documenta la **arquitectura propuesta de integración**. Los endpoints específicos dependerán de la API del SaaS externo.

### 7.1 Autenticación Delegada

**Opción A: JWT compartido (recomendado si el SaaS lo soporta)**

```
Usuario hace clic en "Iniciar sesión" en ELEMENT
        │
        ▼
Redirección al SaaS de autenticación
        │
        ▼
SaaS valida credenciales y genera JWT firmado con SECRET compartido
        │
        ▼
Redirección de vuelta a ELEMENT con ?token=xxx en la URL
        │
        ▼
ELEMENT verifica la firma del JWT usando el mismo SECRET compartido
        │
        ▼
ELEMENT crea/actualiza el usuario en tabla users (si no existe)
        │
        ▼
ELEMENT guarda el token en localStorage y carga datos propios
```

**Campos necesarios en `users` para esta integración:**
- `externalSaaSId` (opcional): ID del usuario en el sistema del SaaS externo
- `role`: sigue siendo necesario porque el SaaS externo puede no saber quién es admin de ELEMENT

**Opción B: API de validación de tokens**

```
Usuario envía usuario/contraseña directamente a ELEMENT
        │
        ▼
ELEMENT hace POST al SaaS: /api/validate-user { username, password }
        │
        ▼
SaaS responde: { valid: true, user: { id, name, email } }
        │
        ▼
ELEMENT genera su propio JWT local y devuelve al frontend
```

### 7.2 Gestión de Imágenes (Landing Page)

**Flujo propuesto:**

```
Admin entra a Panel de Imágenes en /admin/landing
        │
        ▼
Hace clic en "Subir nueva imagen"
        │
        ▼
ELEMENT muestra iframe o redirige al uploader del SaaS externo
        │
        ▼
Admin selecciona archivo en el SaaS
        │
        ▼
SaaS procesa, optimiza y guarda la imagen en su CDN
        │
        ▼
SaaS devuelve a ELEMENT (vía webhook o callback URL):
        {
          "url": "https://cdn.saaspropio.com/element/hero-bg.webp",
          "publicId": "element/hero-bg",
          "width": 1920,
          "height": 1080,
          "mimeType": "image/webp"
        }
        │
        ▼
ELEMENT guarda en tabla landing_images:
        type, url, metadata (JSON del response), uploadedBy
        │
        ▼
ELEMENT genera audit_log con la acción UPLOAD_IMAGE
```

**Webhook que ELEMENT debe exponer para el SaaS:**

```http
POST /api/webhooks/image-uploaded
Content-Type: application/json
X-SaaS-Signature: <hmac-sha256>

{
  "event": "image.uploaded",
  "data": {
    "url": "https://cdn...",
    "publicId": "...",
    "metadata": { ... }
  }
}
```

**Alternativa si el SaaS no soporta webhooks:**
El admin copia la URL pública del SaaS y la pega manualmente en un campo del panel admin de ELEMENT. Menos automático pero funciona sin integración compleja.

### 7.3 Sincronización de Usuarios

**Opción recomendada: Webhook de creación de usuario**

```
Nuevo usuario se registra en el SaaS externo
        │
        ▼
SaaS hace POST a ELEMENT: /api/webhooks/user-created
        │
        ▼
ELEMENT recibe:
        {
          "event": "user.created",
          "data": {
            "id": "uuid-saas-123",
            "email": "juan@example.com",
            "name": "Juan Pérez",
            "username": "juanp"
          }
        }
        │
        ▼
ELEMENT crea registro en tabla users:
        id = generar UUID local
        externalSaaSId = "uuid-saas-123"
        email, name, username = datos del webhook
        password = "DELEGATED" (o hash random, no se usa)
        role = "user"
```

**Ventaja:** El usuario no necesita registrarse dos veces. Su cuenta existe en el SaaS maestro y se replica automáticamente en ELEMENT.

---

## 8. Flujos de Datos

### 8.1 Flujo de Guardado de Cotización

```
Usuario completa wizard de cotización
        │
        ▼
Frontend calcula area.total y price (calculator.ts)
        │
        ▼
Frontend crea objeto Quote {
  id: Date.now(),
  client, project,
  area, price,
  data: JSON.stringify(formData),
  ...
}
        │
        ├──► Se añade al estado local Zustand
        │         (visible inmediatamente en Historial)
        │
        └──► POST /api/quotes
                │
                ▼
        Backend guarda en tabla quotes (data como String)
                │
                ▼
        Al recargar / iniciar sesión:
                GET /api/quotes → Reemplaza estado local
```

### 8.2 Flujo de Generación de Cuenta de Cobro (Invoice)

```
Usuario hace clic en "Generar Cuenta de Cobro"
        │
        ▼
HistoryPage carga quote.data en formData (Zustand)
        │
        ▼
Navega a /invoice/:quoteId
        │
        ▼
InvoicePage lee formData y config
Si formData está vacío (refresh):
        └──► Busca quote por quoteId y recarga formData
        │
        ▼
Recalcula área y precio con calculateArea() / calculatePrice()
        │
        ▼
Renderiza documento imprimible
```

### 8.3 Flujo de Subida de Imagen por Admin

```
Admin entra a /admin/landing/images
        │
        ▼
Hace clic "Subir imagen"
        │
        ├──► Opción A: Redirige a SaaS externo
        │         SaaS procesa → Devuelve URL
        │         Admin copia URL → Pega en formulario
        │
        └──► Opción B: SaaS soporta webhook
        │         SaaS notifica a ELEMENT vía POST
        │         ELEMENT guarda automáticamente
        │
        ▼
ELEMENT guarda en landing_images
        │
        ▼
ELEMENT registra audit_log (UPLOAD_IMAGE)
        │
        ▼
Landing page inmediatamente muestra la nueva imagen
```

### 8.4 Flujo de Actualización de Landing por Admin

```
Admin entra a /admin/landing/content
        │
        ▼
Edita campo: Hero Title = "Nuevo título"
        │
        ▼
Frontend envía PUT /api/admin/site-config
        { section: "hero", key: "title", value: "Nuevo título" }
        │
        ▼
Backend actualiza site_configs
        Antes: guarda oldValue en audit_log
        Después: guarda newValue en audit_log
        │
        ▼
Landing page lee GET /api/site-config y muestra el nuevo título
```

---

## 9. Migraciones

Historial completo:

| Migración | Fecha | Cambio |
|-----------|-------|--------|
| `20260602190119_init` | Jun 2026 | Creación inicial: `users`, `quotes`, `user_configs` |
| `20260602194631_remove_role` | Jun 2026 | Eliminación del campo `role` de `users` |
| `20260602235506_store_landing_admin` | Jun 2026 | **Tienda + Admin**: reintroduce `role` en `users`, crea `site_configs`, `landing_images`, `service_catalog`, `audit_logs` |

### Comandos útiles

```bash
# Ver base de datos en interfaz visual
npx prisma studio

# Crear nueva migración después de editar schema.prisma
npx prisma migrate dev --name nombre_del_cambio

# Regenerar cliente Prisma
npx prisma generate

# Forzar regeneración en Windows si hay bloqueo de archivo
Remove-Item -Recurse -Force "node_modules\.prisma\client"
npx prisma generate
```

---

## 10. Schema Prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// ───────────────────────────────────────────────────────────
// 1. AUTENTICACIÓN Y USUARIOS
// ───────────────────────────────────────────────────────────

model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  username  String   @unique
  password  String
  role      String   @default("user") // "user" | "admin"
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  quotes     Quote[]
  config     UserConfig?
  auditLogs  AuditLog[]

  @@map("users")
}

// ───────────────────────────────────────────────────────────
// 2. COTIZACIONES (herramienta interna por usuario)
// ───────────────────────────────────────────────────────────

model Quote {
  id        Int      @id @default(autoincrement())
  client    String
  project   String
  area      Float
  price     Float
  status    String   @default("draft") // draft | sent | paid | completed
  data      String   // JSON stringified QuoteFormData
  date      String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  userId String @map("user_id")
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("quotes")
}

// ───────────────────────────────────────────────────────────
// 3. CONFIGURACIÓN PERSONAL POR USUARIO (cotización)
// ───────────────────────────────────────────────────────────

model UserConfig {
  id              Int    @id @default(autoincrement())
  services        String @default("{}") // JSON stringified
  subPackages     String @default("{}")
  completePackage String @default("{}")
  paymentPlan     String @default("{}")
  invoice         String @default("{}")
  estimation      String @default("{}")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  userId String @unique @map("user_id")
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_configs")
}

// ───────────────────────────────────────────────────────────
// 4. CONFIGURACIÓN GLOBAL DEL SITIO / TIENDA (admin)
// ───────────────────────────────────────────────────────────

model SiteConfig {
  id        Int      @id @default(autoincrement())
  section   String
  key       String
  value     String
  valueType String   @default("text") // text | markdown | image_url | color | json | boolean
  active    Boolean  @default(true)
  updatedBy String?  @map("updated_by")
  updatedAt DateTime @updatedAt @map("updated_at")
  createdAt DateTime @default(now()) @map("created_at")

  @@unique([section, key])
  @@map("site_configs")
}

// ───────────────────────────────────────────────────────────
// 5. IMÁGENES DE LA LANDING PAGE (admin + SaaS externo)
// ───────────────────────────────────────────────────────────

model LandingImage {
  id          Int      @id @default(autoincrement())
  type        String
  url         String
  alt         String?
  order       Int      @default(0)
  active      Boolean  @default(true)
  metadata    String?
  uploadedBy  String?  @map("uploaded_by")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("landing_images")
}

// ───────────────────────────────────────────────────────────
// 6. CATÁLOGO DE SERVICIOS PÚBLICOS (admin)
// ───────────────────────────────────────────────────────────

model ServiceCatalog {
  id               Int      @id @default(autoincrement())
  name             String
  slug             String   @unique
  description      String?
  shortDescription String?  @map("short_description")
  price            Float?
  priceUnit        String   @default("/m²") @map("price_unit")
  imageUrl         String?  @map("image_url")
  category         String   @default("general")
  features         String?
  active           Boolean  @default(true)
  displayOrder     Int      @default(0) @map("display_order")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")
  createdBy        String?  @map("created_by")

  @@map("service_catalog")
}

// ───────────────────────────────────────────────────────────
// 7. AUDIT LOG (trazabilidad de cambios del admin)
// ───────────────────────────────────────────────────────────

model AuditLog {
  id          Int      @id @default(autoincrement())
  action      String
  entity      String
  entityId    String?  @map("entity_id")
  oldValue    String?  @map("old_value")
  newValue    String?  @map("new_value")
  userId      String   @map("user_id")
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now()) @map("created_at")

  @@map("audit_logs")
}
```

---

## 11. Rutas API

### Públicas (no requieren auth)

| Método | Ruta | Tabla(s) | Descripción |
|--------|------|----------|-------------|
| `GET` | `/api/health` | — | Health check del backend |
| `GET` | `/api/site-config` | `site_configs` | Obtener configuración global de la landing |
| `GET` | `/api/landing-images` | `landing_images` | Obtener imágenes activas de la landing |
| `GET` | `/api/service-catalog` | `service_catalog` | Listar servicios públicos activos |
| `GET` | `/api/service-catalog/:slug` | `service_catalog` | Detalle de un servicio por slug |

### Autenticación

| Método | Ruta | Tabla | Descripción |
|--------|------|-------|-------------|
| `POST` | `/api/auth/register` | `users` | Registro local (fallback) |
| `POST` | `/api/auth/login` | `users` | Login local (fallback) |
| `GET` | `/api/auth/me` | `users` | Perfil del usuario autenticado |

### Cotizador (protegidas, role = user)

| Método | Ruta | Tabla | Descripción |
|--------|------|-------|-------------|
| `GET` | `/api/quotes` | `quotes` | Listar cotizaciones del usuario |
| `POST` | `/api/quotes` | `quotes` | Crear cotización |
| `GET` | `/api/quotes/:id` | `quotes` | Obtener una cotización |
| `PUT` | `/api/quotes/:id` | `quotes` | Actualizar cotización |
| `DELETE` | `/api/quotes/:id` | `quotes` | Eliminar cotización |
| `GET` | `/api/config` | `user_configs` | Obtener configuración personal |
| `PUT` | `/api/config` | `user_configs` | Actualizar configuración personal |

### Admin (protegidas, role = admin)

| Método | Ruta | Tabla | Descripción |
|--------|------|-------|-------------|
| `GET` | `/api/admin/site-config` | `site_configs` | Listar toda la config del sitio |
| `PUT` | `/api/admin/site-config` | `site_configs` | Actualizar una clave de config |
| `GET` | `/api/admin/landing-images` | `landing_images` | Listar todas las imágenes |
| `POST` | `/api/admin/landing-images` | `landing_images` | Registrar nueva imagen (después de subir al SaaS) |
| `PUT` | `/api/admin/landing-images/:id` | `landing_images` | Actualizar imagen (URL, alt, active, order) |
| `DELETE` | `/api/admin/landing-images/:id` | `landing_images` | Eliminar referencia de imagen |
| `GET` | `/api/admin/service-catalog` | `service_catalog` | Listar todos los servicios |
| `POST` | `/api/admin/service-catalog` | `service_catalog` | Crear servicio público |
| `PUT` | `/api/admin/service-catalog/:id` | `service_catalog` | Actualizar servicio |
| `DELETE` | `/api/admin/service-catalog/:id` | `service_catalog` | Eliminar/desactivar servicio |
| `GET` | `/api/admin/audit-logs` | `audit_logs` | Ver historial de cambios |

### Webhooks (para el SaaS externo)

| Método | Ruta | Tabla | Descripción |
|--------|------|-------|-------------|
| `POST` | `/api/webhooks/user-created` | `users` | El SaaS notifica que un usuario se registró |
| `POST` | `/api/webhooks/image-uploaded` | `landing_images` | El SaaS notifica que una imagen fue subida |
| `POST` | `/api/webhooks/image-deleted` | `landing_images` | El SaaS notifica que una imagen fue eliminada |

---

## 12. Notas de Implementación y Lecciones Aprendidas

### Doble serialización JSON en `quotes.data` (arreglado)

**Síntoma:** Al iniciar sesión y generar una cuenta de cobro sobre una cotización guardada, el documento aparecía vacío (sin cliente, servicios ni total).

**Causa raíz:** El frontend enviaba `data` ya serializado como `JSON.stringify(formData)`. El backend hacía `JSON.stringify(data)` nuevamente, almacenando un string doblemente escapado. Al leer, `JSON.parse(quote.data)` devolvía un **string** en lugar del objeto `QuoteFormData`.

**Solución:**
- Backend (`quotes.js`): `data: typeof data === 'string' ? data : JSON.stringify(data || {})`
- Frontend: utilidad `safeParseQuoteData()` que intenta parsear dos veces si la primera devuelve un string.

### IDs locales vs IDs de base de datos

- El frontend usa `Date.now()` como ID temporal al crear una cotización.
- El backend usa autoincrement (`Int @id @default(autoincrement())`) como ID real.
- El frontend ignora la respuesta del backend en `addQuote()` (fire-and-forget).
- Al recargar, `loadFromBackend()` trae los IDs reales y reemplaza el estado local.
- **Implicación:** la URL `/invoice/:quoteId` usa el ID real de la BD. `InvoicePage` carga por ese ID si `formData` está vacío.

### Reintroducción del campo `role`

- En la migración inicial `20260602190119_init` el campo `role` existía.
- En `20260602194631_remove_role` se eliminó porque no había diferenciación de roles.
- En `20260602235506_store_landing_admin` se reintroduce como `String @default("user")` para soportar el panel de administración de la tienda.
- **Lección:** Evitar migraciones que eliminan campos que podrían necesitarse en el futuro. Mejor dejarlos con un valor por defecto.

### Integración SaaS: documentar antes de implementar

- Antes de escribir código de integración con el SaaS externo, se documentó la arquitectura propuesta (webhooks, JWT compartido, callbacks).
- Esto permite validar con el equipo del SaaS externo **qué endpoints necesitan exponer** y **qué webhooks debemos recibir** antes de invertir tiempo en código.
- **Recomendación:** Pedir al equipo del SaaS la documentación de su API y adaptar la sección 7 de este documento con URLs y payloads reales.

---

*Documento generado automáticamente a partir del schema Prisma y el código fuente del backend. Última actualización: Junio 2026.*
