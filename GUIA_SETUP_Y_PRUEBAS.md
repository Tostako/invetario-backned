# Guía de Setup y Pruebas en Postman
## Inventario Tiendas — Backend SaaS Multitenant

---

## ÍNDICE

1. [Requisitos previos](#1-requisitos-previos)
2. [Configurar Supabase](#2-configurar-supabase)
3. [Configurar el proyecto local](#3-configurar-el-proyecto-local)
4. [Arrancar el servidor](#4-arrancar-el-servidor)
5. [Configurar Postman](#5-configurar-postman)
6. [Pruebas — Auth](#6-pruebas--auth)
7. [Pruebas — Productos](#7-pruebas--productos)
8. [Flujo completo de prueba (orden recomendado)](#8-flujo-completo-de-prueba-orden-recomendado)
9. [Errores comunes y soluciones](#9-errores-comunes-y-soluciones)

---

## 1. Requisitos previos

| Herramienta | Versión mínima | Descarga |
|---|---|---|
| Node.js | 18.x o superior | https://nodejs.org |
| npm | 9.x o superior | viene con Node.js |
| Postman | cualquiera | https://postman.com/downloads |
| Cuenta Supabase | — | https://supabase.com |

Verificar instalación:
```bash
node --version   # debe mostrar v18.x.x o superior
npm --version    # debe mostrar 9.x.x o superior
```

---

## 2. Configurar Supabase

### 2.1 Crear proyecto
1. Entrar a https://supabase.com y hacer login
2. Click en **New project**
3. Elegir organización, nombre del proyecto, contraseña de DB y región
4. Esperar que el proyecto se inicialice (~2 minutos)

### 2.2 Ejecutar las migrations

Ir a **SQL Editor** (menú lateral izquierdo) y ejecutar cada archivo en este orden.
Copiar el contenido completo de cada archivo y hacer click en **Run**:

```
database/01_extensions.sql     ← primero siempre
database/02_shops.sql
database/03_users.sql
database/04_categories.sql
database/05_suppliers.sql
database/06_products.sql
database/07_customers.sql
database/08_orders.sql
database/09_inventory_movements.sql
database/10_rls_policies.sql   ← último
```

> Si aparece error "extension already exists" en el 01, ignorarlo y continuar.

### 2.3 Obtener la DATABASE_URL

1. En Supabase ir a **Settings → Database**
2. Bajar hasta **Connection string**
3. Seleccionar tab **URI**
4. Copiar la URL — tiene este formato:
   ```
   postgresql://postgres:[TU_PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
   ```
5. Reemplazar `[TU_PASSWORD]` con la contraseña que pusiste al crear el proyecto

---

## 3. Configurar el proyecto local

### 3.1 Clonar e instalar

```bash
# Entrar a la carpeta del proyecto
cd "D:\git proyectos\invetario_Tiendas_Backend"

# Instalar dependencias
npm install
```

### 3.2 Crear el archivo .env

Crear un archivo llamado `.env` en la raíz del proyecto con este contenido:

```env
PORT=3000
NODE_ENV=development

DATABASE_URL=postgresql://postgres:[TU_PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres

JWT_SECRET=una_clave_secreta_larga_y_segura_de_al_menos_32_caracteres
JWT_EXPIRES_IN=7d
```

> **Importante:** `JWT_SECRET` debe tener al menos 32 caracteres. Ejemplo:
> `mi_super_clave_secreta_2024_inventario_saas`

### 3.3 Verificar estructura final

```
invetario_Tiendas_Backend/
├── .env                    ← creado por ti (no subir a git)
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── database/               ← archivos SQL ejecutados en Supabase
└── src/
    ├── app.ts
    ├── server.ts
    ├── config/
    ├── middlewares/
    ├── modules/
    │   ├── auth/
    │   └── products/
    └── shared/
```

---

## 4. Arrancar el servidor

```bash
npm run dev
```

Salida esperada en consola:
```
[DB] Connection established successfully
[Server] Running on port 3000 (development)
```

Si aparece error de conexión a DB, revisar que la `DATABASE_URL` en `.env` sea correcta.

### Verificar que funciona

Abrir el navegador o Postman en:
```
GET http://localhost:3000/health
```

Respuesta esperada:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2024-01-15T10:00:00.000Z"
  }
}
```

---

## 5. Configurar Postman

### 5.1 Crear un entorno (Environment)

1. En Postman, click en **Environments** (ícono de ojo arriba a la derecha)
2. Click en **+** para crear uno nuevo
3. Nombre: `Inventario Local`
4. Agregar estas variables:

| Variable | Initial Value | Current Value |
|---|---|---|
| `base_url` | `http://localhost:3000/api/v1` | `http://localhost:3000/api/v1` |
| `token` | (vacío) | (vacío) — se llenará automáticamente |
| `shop_slug` | (vacío) | (vacío) — se llenará al registrar |

5. Click en **Save**
6. Seleccionar el entorno `Inventario Local` en el dropdown superior derecho

### 5.2 Configurar guardado automático del token

En cada request de **login** y **register**, ir a la pestaña **Tests** y pegar:

```javascript
const res = pm.response.json();
if (res.success && res.data?.token) {
    pm.environment.set("token", res.data.token);
    console.log("Token guardado automáticamente");
}
```

### 5.3 Configurar el header de autorización

Para todos los requests que requieran auth:
- Pestaña **Auth** → Type: **Bearer Token**
- Token: `{{token}}`

O agregar manualmente en **Headers**:
```
Key:   Authorization
Value: Bearer {{token}}
```

---

## 6. Pruebas — Auth

### 6.1 Registrar una tienda nueva

```
POST http://localhost:3000/api/v1/auth/register
```

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "shop_name": "Tienda Demo",
  "shop_slug": "tienda-demo",
  "shop_email": "contacto@tiendademo.com",
  "owner_name": "Carlos López",
  "owner_email": "carlos@tiendademo.com",
  "password": "MiPassword123"
}
```

**Respuesta esperada (201):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "shopId": "uuid-de-la-tienda",
    "userId": "uuid-del-owner"
  }
}
```

> Guardar el `shop_slug` usado (`tienda-demo`) — lo necesitarás para el login.
> Pegar el script de Tests para guardar el token automáticamente.

---

### 6.2 Login

```
POST http://localhost:3000/api/v1/auth/login
```

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "carlos@tiendademo.com",
  "password": "MiPassword123",
  "shop_slug": "tienda-demo"
}
```

**Respuesta esperada (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "name": "Carlos López",
      "email": "carlos@tiendademo.com",
      "role": "owner"
    }
  }
}
```

> Pegar el script de Tests para guardar el token.

**Casos de error a probar:**

| Escenario | Body | Código esperado |
|---|---|---|
| Password incorrecta | password: "incorrecta" | 401 |
| Email inexistente | email: "no@existe.com" | 401 |
| Shop_slug incorrecto | shop_slug: "no-existe" | 401 |
| Email sin formato | email: "noesemail" | 422 |
| Password vacía | password: "" | 422 |

---

## 7. Pruebas — Productos

> Todos los endpoints de productos requieren el header `Authorization: Bearer {{token}}`

### 7.1 Crear un producto

```
POST http://localhost:3000/api/v1/products
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body (raw JSON) — mínimo:**
```json
{
  "sku": "CAM-001",
  "name": "Camiseta Básica Blanca",
  "price": 25.99,
  "stock": 100,
  "stock_min": 10
}
```

**Body completo (con todos los campos opcionales):**
```json
{
  "sku": "CAM-001",
  "name": "Camiseta Básica Blanca",
  "description": "Camiseta 100% algodón, talla única",
  "price": 25.99,
  "cost": 12.50,
  "stock": 100,
  "stock_min": 10,
  "stock_max": 500,
  "unit": "unit"  
}
```

**Respuesta esperada (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-del-producto",
    "shop_id": "uuid-de-tu-tienda",
    "sku": "CAM-001",
    "name": "Camiseta Básica Blanca",
    "price": "25.99",
    "stock": 100,
    "stock_min": 10,
    "is_active": true,
    "created_at": "2024-01-15T10:00:00.000Z"
  }
}
```

> Guardar el `id` del producto creado para las siguientes pruebas.

**Casos de error a probar:**

| Escenario | Qué cambiar | Código esperado |
|---|---|---|
| SKU duplicado | Repetir el mismo request | 409 |
| Precio negativo | price: -5 | 422 |
| SKU con espacios | sku: "CAM 001" | 422 |
| Sin token | Quitar el header Authorization | 401 |
| stock_max menor que stock_min | stock_min: 50, stock_max: 10 | 422 |

---

### 7.2 Listar productos

```
GET http://localhost:3000/api/v1/products
```

**Headers:**
```
Authorization: Bearer {{token}}
```

**Respuesta esperada (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "sku": "CAM-001",
      "name": "Camiseta Básica Blanca",
      "price": "25.99",
      "stock": 100,
      ...
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

**Filtros disponibles — agregar como Query Params:**

| Param | Ejemplo | Descripción |
|---|---|---|
| `search` | `?search=camiseta` | Busca en nombre y SKU |
| `low_stock` | `?low_stock=true` | Solo productos con stock <= stock_min |
| `page` | `?page=2` | Número de página |
| `limit` | `?limit=10` | Resultados por página |
| `category_id` | `?category_id=uuid` | Filtrar por categoría |
| `supplier_id` | `?supplier_id=uuid` | Filtrar por proveedor |

**Ejemplos de URL con filtros:**
```
GET http://localhost:3000/api/v1/products?search=camiseta
GET http://localhost:3000/api/v1/products?low_stock=true
GET http://localhost:3000/api/v1/products?page=1&limit=5
GET http://localhost:3000/api/v1/products?search=cam&page=1&limit=10
```

---

### 7.3 Obtener un producto por ID

```
GET http://localhost:3000/api/v1/products/:id
```

**Ejemplo:**
```
GET http://localhost:3000/api/v1/products/uuid-del-producto
```

**Respuesta esperada (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-del-producto",
    "sku": "CAM-001",
    "name": "Camiseta Básica Blanca",
    "category_name": null,
    "supplier_name": null,
    ...
  }
}
```

**Casos de error a probar:**

| Escenario | URL | Código esperado |
|---|---|---|
| ID inexistente | `/products/00000000-0000-4000-8000-000000000000` | 404 |
| ID malformado | `/products/no-es-uuid` | 422 |
| ID de otra tienda | ID válido de otra tienda | 404 |

---

### 7.4 Editar un producto (parcial)

```
PATCH http://localhost:3000/api/v1/products/:id
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body — solo los campos que quieres cambiar:**
```json
{
  "price": 29.99,
  "stock_min": 15
}
```

**Respuesta esperada (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "price": "29.99",
    "stock_min": 15,
    ...
  }
}
```

---

### 7.5 Ajustar stock

```
PATCH http://localhost:3000/api/v1/products/:id/stock
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body para sumar stock (entrada de mercancía):**
```json
{
  "delta": 50
}
```

**Body para restar stock (salida):**
```json
{
  "delta": -10
}
```

**Respuesta esperada (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "stock": 150,
    ...
  }
}
```

**Casos de error a probar:**

| Escenario | Body | Código esperado |
|---|---|---|
| Stock resultante negativo | delta: -9999 | 422 |
| Delta cero | delta: 0 | 422 |
| Delta decimal | delta: 1.5 | 422 |
| Delta no es número | delta: "diez" | 422 |

---

### 7.6 Eliminar (soft delete) un producto

```
DELETE http://localhost:3000/api/v1/products/:id
```

> Solo funciona con rol `owner`. Con rol `admin` o `staff` recibirás 403.

**Headers:**
```
Authorization: Bearer {{token}}
```

**Respuesta esperada (200):**
```json
{
  "success": true,
  "data": {
    "message": "Product deactivated successfully"
  }
}
```

> El producto no se borra de la DB, solo se marca como `is_active = false`.
> Ya no aparecerá en el listado de productos.

---

## 8. Flujo completo de prueba (orden recomendado)

Seguir estos pasos en orden para una prueba end-to-end completa:

```
PASO 1 — Verificar que el servidor responde
  GET /health
  → Esperar: { success: true, data: { status: "ok" } }

PASO 2 — Registrar la primera tienda
  POST /auth/register
  → Guardar el token automáticamente (script en Tests)

PASO 3 — Verificar el token con login
  POST /auth/login
  → Debe devolver el mismo usuario con token renovado

PASO 4 — Crear 3 productos distintos
  POST /products  (CAM-001, Camiseta)
  POST /products  (PAN-001, Pantalón)
  POST /products  (ZAP-001, Zapatos, con stock=5, stock_min=10)

PASO 5 — Listar todos los productos
  GET /products
  → Deben aparecer los 3, meta.total = 3

PASO 6 — Probar filtro de stock bajo
  GET /products?low_stock=true
  → Solo debe aparecer ZAP-001 (stock 5 <= stock_min 10)

PASO 7 — Probar búsqueda
  GET /products?search=cam
  → Solo debe aparecer CAM-001

PASO 8 — Obtener un producto por ID
  GET /products/:id  (usar el ID de CAM-001)

PASO 9 — Editar precio
  PATCH /products/:id  { "price": 35.00 }
  → Verificar que el precio cambió

PASO 10 — Ajustar stock (entrada)
  PATCH /products/:id/stock  { "delta": 20 }
  → Stock debe aumentar en 20

PASO 11 — Intentar stock negativo
  PATCH /products/:id/stock  { "delta": -99999 }
  → Debe dar 422

PASO 12 — Intentar SKU duplicado
  POST /products  (con sku: "CAM-001" otra vez)
  → Debe dar 409

PASO 13 — Probar acceso sin token
  GET /products  (sin header Authorization)
  → Debe dar 401

PASO 14 — Eliminar un producto
  DELETE /products/:id  (ID de PAN-001)
  → Debe dar 200

PASO 15 — Verificar que ya no aparece
  GET /products
  → Solo deben aparecer 2 productos (CAM-001 y ZAP-001)
```

---

## 9. Errores comunes y soluciones

### El servidor no arranca

**Error:** `Missing required environment variable: DATABASE_URL`
```
Solución: Verificar que el archivo .env existe en la raíz y tiene DATABASE_URL definida.
```

**Error:** `connection refused` o `ECONNREFUSED`
```
Solución:
  1. Verificar que la DATABASE_URL es correcta
  2. Verificar que el proyecto de Supabase está activo (no pausado)
  3. En Supabase: Settings → Database → revisar que el host sea correcto
```

**Error:** `password authentication failed`
```
Solución: La contraseña en la DATABASE_URL es incorrecta.
Ir a Supabase → Settings → Database → Reset database password.
```

---

### Errores en Postman

**401 — Missing or malformed authorization header**
```
Solución: Verificar que el header Authorization tiene el formato:
Bearer eyJhbGci...   (con espacio entre "Bearer" y el token)
```

**401 — Token expired**
```
Solución: Volver a hacer login para obtener un token fresco.
El token expira en 7 días por defecto.
```

**403 — Insufficient permissions**
```
Solución: La operación requiere un rol superior.
  - DELETE de producto → solo owner
  - POST/PATCH producto → admin o owner
  - staff solo puede leer y ajustar stock
```

**403 — Shop is suspended**
```
Solución: La tienda fue desactivada. Activarla en Supabase:
UPDATE shops SET is_active = TRUE WHERE slug = 'tu-slug';
```

**422 — Validation error**
```
La respuesta incluye el campo "errors" con el detalle:
{
  "success": false,
  "message": "Validation error",
  "errors": [
    { "field": "price", "message": "Number must be greater than or equal to 0" }
  ]
}
Solución: Corregir el campo indicado en el body.
```

**409 — SKU already exists**
```
Solución: El SKU ya existe en esa tienda. Usar un SKU diferente.
```

**404 — Product not found**
```
Posibles causas:
  1. El ID no existe en la DB
  2. El producto fue desactivado (soft delete)
  3. El producto pertenece a otra tienda (correcto por diseño multitenant)
```

---

### Verificar datos directamente en Supabase

Si algo falla, ir a **Supabase → Table Editor** para ver los datos:

```sql
-- Ver todas las tiendas
SELECT id, name, slug, is_active FROM shops;

-- Ver usuarios de una tienda
SELECT id, name, email, role FROM users WHERE shop_id = 'uuid-de-la-tienda';

-- Ver productos de una tienda
SELECT id, sku, name, price, stock, is_active FROM products WHERE shop_id = 'uuid-de-la-tienda';
```

---

## Resumen rápido de endpoints

| Método | Endpoint | Auth | Rol mínimo |
|---|---|---|---|
| GET | `/health` | No | — |
| POST | `/api/v1/auth/register` | No | — |
| POST | `/api/v1/auth/login` | No | — |
| GET | `/api/v1/products` | Sí | staff |
| GET | `/api/v1/products/:id` | Sí | staff |
| POST | `/api/v1/products` | Sí | admin |
| PATCH | `/api/v1/products/:id` | Sí | admin |
| DELETE | `/api/v1/products/:id` | Sí | owner |
| PATCH | `/api/v1/products/:id/stock` | Sí | staff |
