# Documentacion de Conexion: Cotizador ELEMENT ↔ SaaS Inventario Tiendas

Esta guia explica como conectar la aplicacion **ELEMENT Cotizador** con el backend **SaaS Inventario Tiendas**.

---

## 1. Vision General de la Integracion

```
┌─────────────────────────────────────────────────────────────────┐
│                    SaaS Inventario Tiendas                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Owner/Admin │  │   Customer   │  │   Tablas SaaS       │  │
│  │  (Dashboard)  │  │  (Arquitecto)│  │  • shops            │  │
│  │               │  │              │  │  • customers        │  │
│  │  Gestiona:    │  │  Usa:        │  │  • users            │  │
│  │  • Landing    │  │  • Quotes     │  │  • site_configs     │  │
│  │  • Imagenes   │  │  • Config     │  │  • landing_images   │  │
│  │  • Auditoria  │  │    de precios │  │  • quotes           │  │
│  │               │  │              │  │  • customer_configs │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                           ▲                                     │
│                           │ JWT Auth                            │
│                           │ (shop_id en el token)               │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                    ┌───────┴───────┐
                    │   Cotizador   │
                    │   (Frontend)  │
                    │               │
                    │  Wizard de    │
                    │  cotizacion   │
                    │  + Generador  │
                    │  de facturas  │
                    └───────────────┘
```

**Conceptos clave:**
- **Owner/Admin** del SaaS = **Admin del Cotizador** (gestiona la tienda, landing, servicios).
- **Customer** del SaaS = **Arquitecto/Constructor** (usa el cotizador, crea presupuestos).
- Cada **Shop** en el SaaS = Una **instancia del cotizador** para un negocio de construccion.

---

## 2. Autenticacion del Arquitecto (Customer)

El cotizador NO tiene su propio sistema de login. Delega la autenticacion al SaaS.

### 2.1 Registro de Arquitecto

El arquitecto se registra como `customer` en el SaaS.

- **URL del SaaS:** `POST /api/v1/auth/customer/register`
- **Body:**
```json
{
  "name": "Juan Perez",
  "email": "juan@arquitecto.com",
  "phone": "+573001234567",
  "password": "PasswordSegura123"
}
```
- **Respuesta:** devuelve `token` JWT con rol `customer`.

> **Nota:** Si el SaaS aun no tiene registro de customers, el admin lo crea desde el dashboard y le envia las credenciales.

### 2.2 Login del Arquitecto

- **URL del SaaS:** `POST /api/v1/auth/login`
- **Body:**
```json
{
  "email": "juan@arquitecto.com",
  "password": "PasswordSegura123"
}
```
- **Respuesta:** devuelve `token` JWT final con:
  - `shop_id`: la tienda a la que pertenece
  - `role`: `customer`
  - `customer_id`: su ID como customer

### 2.3 Guardar el Token en el Cotizador

El frontend del cotizador debe guardar el token en:
- `localStorage` (para persistencia entre sesiones)
- Y enviarlo en **cada request** en el header:
```
Authorization: Bearer <token>
```

---

## 3. Endpoints del SaaS que Usa el Cotizador

### 3.1 Landing Page Publica (Sin Auth)

El cotizador muestra la landing page del negocio ANTES de que el arquitecto haga login.

| Uso en Cotizador | Endpoint SaaS | Auth |
|---|---|---|
| Cargar textos/colores de la landing | `GET /api/v1/public/site-config?shop_slug=mi-tienda` | No |
| Cargar imagenes (hero, logos) | `GET /api/v1/public/landing-images?shop_slug=mi-tienda` | No |

**Ejemplo de uso:**
```javascript
// Al cargar la landing del cotizador
const slug = 'constructora-element'; // del .env o de la URL
const config = await fetch(`/api/v1/public/site-config?shop_slug=${slug}`);
const images = await fetch(`/api/v1/public/landing-images?shop_slug=${slug}`);
```

### 3.2 Cotizaciones (Auth: Customer)

El arquitecto crea, edita y gestiona sus cotizaciones.

| Uso en Cotizador | Endpoint SaaS | Metodo | Body |
|---|---|---|---|
| Listar mis cotizaciones | `/api/v1/quotes` | GET | — |
| Crear nueva cotizacion | `/api/v1/quotes` | POST | Ver seccion 4 |
| Ver una cotizacion | `/api/v1/quotes/:id` | GET | — |
| Editar cotizacion | `/api/v1/quotes/:id` | PATCH | Campos a cambiar |
| Eliminar cotizacion | `/api/v1/quotes/:id` | DELETE | — |

**Seguridad:** el backend solo devuelve las cotizaciones que pertenecen al `customer_id` del token. Si intenta ver una de otro, recibe `403 Forbidden`.

### 3.3 Configuracion de Precios (Auth: Customer)

Cada arquitecto configura sus propios precios y datos de facturacion.

| Uso en Cotizador | Endpoint SaaS | Metodo | Body |
|---|---|---|---|
| Cargar mi config | `/api/v1/customer-config/me` | GET | — |
| Guardar mi config | `/api/v1/customer-config/me` | PUT | Ver seccion 5 |

---

## 4. Flujo de Creacion de Cotizacion

```
Arquitecto completa wizard de cotizacion
           │
           ▼
Frontend calcula area y precio (usando customer-config)
           │
           ▼
POST /api/v1/quotes
{
  "client": "Maria Garcia",
  "project": "Casa Campestre",
  "area": 250.5,
  "price": 17500000,
  "status": "draft",
  "data": { ...toda la info del wizard... }
}
           │
           ▼
Backend guarda en tabla quotes (vinculado a customer_id)
           │
           ▼
Frontend recibe la cotizacion creada con su ID real
           │
           ▼
Se redirige a /history o /invoice/:quoteId
```

### 4.1 Estructura del campo `data` (JSONB)

Este campo guarda toda la informacion del wizard de cotizacion:

```json
{
  "client": "Maria Garcia",
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
  "additionalServices": [],
  "calculations": {
    "areaTotal": 250.5,
    "pricePerM2": 7000,
    "subtotal": 17535000,
    "discountAmount": 0,
    "total": 17535000
  }
}
```

> **Nota:** la estructura exacta la define el frontend del cotizador. El backend solo la almacena como JSONB.

### 4.2 Estados de una Cotizacion

| Estado | Significado | Acciones posibles |
|---|---|---|
| `draft` | Borrador, editable | Editar, enviar, eliminar |
| `sent` | Enviada al cliente | Ver, generar cuenta de cobro |
| `paid` | Pagada por el cliente | Ver, archivar |
| `completed` | Proyecto terminado | Solo lectura |

---

## 5. Flujo de Configuracion de Precios

```
Arquitecto entra a "Ajustes" o "Configuracion"
           │
           ▼
GET /api/v1/customer-config/me
           │
           ▼
Si existe: precargar formularios
Si no existe: mostrar formularios vacios
           │
           ▼
Arquitecto edita precios, datos de empresa, etc.
           │
           ▼
PUT /api/v1/customer-config/me
{
  "services": {
    "arch": { "price": 7000, "unit": "/m2", "name": "Diseno Arquitectonico" },
    "struct": { "price": 5000, "unit": "/m2", "name": "Estructuras" }
  },
  "invoice": {
    "company": "Constructora XYZ",
    "nit": "123456789-0",
    "representative": "Juan Perez",
    "phone": "+573001234567",
    "address": "Calle 123 # 45-67",
    "bank": "Bancolombia",
    "account": "123-456789",
    "accountType": "Ahorros"
  },
  "estimation": {
    "obra_negra": 2500000,
    "obra_gris": 1800000,
    "acabados": 3200000
  }
}
           │
           ▼
Backend hace upsert (crea si no existe, actualiza si existe)
           │
           ▼
Frontend muestra confirmacion
```

### 5.1 Estructura recomendada de customer-config

**`services`** — Precios por servicio:
```json
{
  "arch": { "price": 7000, "unit": "/m2", "name": "Diseno Arquitectonico" },
  "struct": { "price": 5000, "unit": "/m2", "name": "Estructuras" },
  "acabados": { "price": 3200, "unit": "/m2", "name": "Acabados" }
}
```

**`invoice`** — Datos para la cuenta de cobro:
```json
{
  "company": "Constructora XYZ S.A.S.",
  "nit": "123456789-0",
  "representative": "Juan Perez",
  "phone": "+573001234567",
  "email": "juan@constructora.com",
  "address": "Calle 123 # 45-67, Bogota",
  "bank": "Bancolombia",
  "account": "123-456789",
  "accountType": "Ahorros",
  "logoUrl": "https://cdn.../logo.png"
}
```

**`payment_plan`** — Plan de pagos por defecto:
```json
{
  "initial": 30,
  "installments": 6,
  "interval": "monthly"
}
```

**`estimation`** — Precios base para calculos:
```json
{
  "obra_negra": 2500000,
  "obra_gris": 1800000,
  "acabados": 3200000,
  "complete_per_m2": 7500
}
```

---

## 6. Flujo de Generacion de Cuenta de Cobro (Invoice)

```
Arquitecto va a Historial > Selecciona cotizacion
           │
           ▼
GET /api/v1/quotes/:id
           │
           ▼
Frontend recarga los datos en el wizard (Zustand)
           │
           ▼
GET /api/v1/customer-config/me
           │
           ▼
Frontend combina: datos de la cotizacion + datos de facturacion
           │
           ▼
Renderiza documento imprimible (PDF o pagina)
           │
           ▼
Opcional: descargar PDF o enviar por email
```

**No hay endpoint especifico para "generar cuenta de cobro".** Es responsabilidad del frontend del cotizador:
1. Leer la cotizacion del SaaS.
2. Leer la config del customer.
3. Renderizar un documento con ambos datos.

---

## 7. Mapeo de Tablas: Cotizador Antiguo → SaaS

| Tabla Cotizador (SQLite) | Tabla SaaS (PostgreSQL) | Notas |
|---|---|---|
| `users` (arquitectos) | `customers` | El arquitecto es un `customer` del SaaS |
| `users` (admin) | `users` (rol owner/admin) | El admin del cotizador es owner/admin del SaaS |
| `quotes` | `quotes` | Misma estructura, ahora con `shop_id` y `customer_id` |
| `user_configs` | `customer_configs` | Misma funcionalidad, ahora vinculada a `customer_id` |
| `site_configs` | `site_configs` | Misma estructura, ahora con `shop_id` |
| `landing_images` | `landing_images` | Misma estructura, ahora con `shop_id` |
| `service_catalog` | **No se migra** | Servicios son fijos o se manejan en `customer_configs.services` |
| `audit_logs` | `audit_logs` | Misma estructura, ahora con `shop_id` |

---

## 8. Checklist de Conexion

### 8.1 Configuracion del Frontend del Cotizador

- [ ] Variable de entorno `VITE_SHOP_SLUG` con el slug de la tienda.
- [ ] Variable de entorno `VITE_API_URL` apuntando al SaaS.
- [ ] Interceptor de Axios/Fetch que agrega `Authorization: Bearer <token>`.

### 8.2 Flujo de Login

- [ ] Pantalla de login que hace `POST /api/v1/auth/login`.
- [ ] Guardar token en `localStorage`.
- [ ] Si el token expira (401), redirigir a login.

### 8.3 Flujo de Landing Page Publica

- [ ] Al entrar al dominio, cargar:
  - `GET /api/v1/public/site-config?shop_slug=...`
  - `GET /api/v1/public/landing-images?shop_slug=...`
- [ ] Renderizar landing dinamicamente con los datos recibidos.

### 8.4 Flujo del Cotizador (Autenticado)

- [ ] Al iniciar sesion, cargar `customer-config/me`.
- [ ] Wizard de cotizacion usa los precios de `customer-config`.
- [ ] Al guardar, hacer `POST /api/v1/quotes`.
- [ ] Historial carga con `GET /api/v1/quotes`.
- [ ] Al editar, hacer `PATCH /api/v1/quotes/:id`.

### 8.5 Flujo de Ajustes

- [ ] Formulario de configuracion de precios.
- [ ] Guardar con `PUT /api/v1/customer-config/me`.
- [ ] Precargar con `GET /api/v1/customer-config/me`.

---

## 9. Codigo de Ejemplo (React / Axios)

### 9.1 Cliente API Configurado

```javascript
// api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // ej: https://saas-backend.com/api/v1
});

// Interceptor: agrega token a cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: maneja 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 9.2 Cargar Landing Publica

```javascript
// landing.service.js
const SHOP_SLUG = import.meta.env.VITE_SHOP_SLUG;

export const loadLandingConfig = async () => {
  const [configRes, imagesRes] = await Promise.all([
    fetch(`/api/v1/public/site-config?shop_slug=${SHOP_SLUG}`),
    fetch(`/api/v1/public/landing-images?shop_slug=${SHOP_SLUG}`),
  ]);
  const config = await configRes.json();
  const images = await imagesRes.json();
  return { config: config.data, images: images.data };
};
```

### 9.3 Guardar Cotizacion

```javascript
// quotes.service.js
import api from './api';

export const createQuote = async (quoteData) => {
  const response = await api.post('/quotes', {
    client: quoteData.client,
    project: quoteData.project,
    area: quoteData.area,
    price: quoteData.price,
    status: 'draft',
    data: quoteData, // todo el wizard
    date: new Date().toISOString().split('T')[0],
  });
  return response.data.data;
};

export const updateQuote = async (id, changes) => {
  const response = await api.patch(`/quotes/${id}`, changes);
  return response.data.data;
};
```

### 9.4 Guardar Config de Precios

```javascript
// config.service.js
import api from './api';

export const getMyConfig = async () => {
  const response = await api.get('/customer-config/me');
  return response.data.data;
};

export const saveMyConfig = async (config) => {
  const response = await api.put('/customer-config/me', config);
  return response.data.data;
};
```

---

## 10. Preguntas Frecuentes

### Q: ¿El arquitecto necesita registrarse dos veces?
**R:** No. Se registra una sola vez como `customer` del SaaS. Esa misma cuenta sirve para el cotizador.

### Q: ¿Que pasa si un arquitecto pertenece a varias tiendas?
**R:** Actualmente cada `customer` pertenece a una sola tienda (`shop_id`). Si en el futuro necesita multi-tienda, se evaluara el cambio.

### Q: ¿El admin del cotizador puede ver las cotizaciones de todos?
**R:** Si. Los endpoints `/api/v1/quotes` y `/api/v1/customer-config` devuelven todos los registros de la tienda cuando el token tiene rol `admin` u `owner`.

### Q: ¿Donde se almacenan las imagenes de la landing?
**R:** En Supabase Storage (CDN). El admin sube la imagen al CDN y luego registra la URL en `/api/v1/landing-images`.

### Q: ¿Hay endpoint para generar PDF de la cuenta de cobro?
**R:** No. El frontend del cotizador debe generar el PDF usando librerias como `jspdf`, `html2canvas` o `react-to-print`, combinando los datos de `quotes` + `customer-config`.

---

*Ultima actualizacion: Junio 2026*
