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
10. [Pruebas — Carrito (HU6 y HU7)](#10-pruebas--carrito-hu6-y-hu7)
11. [Pruebas — Pedidos (HU8, HU9 y HU10)](#11-pruebas--pedidos-hu8-hu9-y-hu10)
12. [Flujo completo — Carrito y Pedidos](#12-flujo-completo-de-prueba--carrito-y-pedidos-orden-recomendado)
13. [Errores comunes — Carrito y Pedidos](#13-errores-comunes--carrito-y-pedidos)
14. [Pruebas — Pasarela de Pago Mercado Pago](#14-pruebas--pasarela-de-pago-mercado-pago)
15. [Errores comunes — Pagos](#15-errores-comunes--pagos)

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

## 10. Pruebas — Carrito (HU6 y HU7)

> Todos los endpoints de carrito requieren el header `Authorization: Bearer {{token}}`
> El carrito es por usuario autenticado — cada usuario tiene su propio carrito dentro de su tienda.

### 10.1 Agregar producto al carrito (HU6)

```
POST http://localhost:3000/api/v1/cart/items
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body (raw JSON):**
```json
{
  "product_id": "uuid-del-producto",
  "quantity": 2
}
```

> **Importante:** Usa el `id` de un producto que hayas creado previamente en la sección 7.1.

**Respuesta esperada (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-del-item-carrito",
    "shop_id": "uuid-de-tu-tienda",
    "user_id": "uuid-de-tu-usuario",
    "product_id": "uuid-del-producto",
    "quantity": 2,
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z"
  }
}
```

> Si el mismo producto ya existe en el carrito, **la cantidad se suma** automáticamente.
> Ejemplo: si ya tenías 2 unidades y agregas 3 más, quedará en 5.

**Casos de error a probar:**

| Escenario | Body | Código esperado |
|---|---|---|
| Producto inexistente | product_id: "00000000-0000-4000-8000-000000000000" | 404 |
| Cantidad mayor al stock | quantity: 99999 | 422 |
| Cantidad cero | quantity: 0 | 422 |
| Cantidad negativa | quantity: -1 | 422 |
| Producto desactivado | product_id de un producto eliminado con DELETE | 422 |
| Sin token | Quitar el header Authorization | 401 |
| product_id no es UUID | product_id: "no-es-uuid" | 422 |

---

### 10.2 Ver carrito completo (HU7)

```
GET http://localhost:3000/api/v1/cart
```

**Headers:**
```
Authorization: Bearer {{token}}
```

**Respuesta esperada (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid-del-item",
        "shop_id": "uuid-tienda",
        "user_id": "uuid-usuario",
        "product_id": "uuid-producto",
        "quantity": 2,
        "created_at": "2024-01-15T10:00:00.000Z",
        "updated_at": "2024-01-15T10:05:00.000Z",
        "product_name": "Camiseta Básica Blanca",
        "product_sku": "CAM-001",
        "unit_price": 25.99,
        "stock_available": 100,
        "subtotal": 51.98
      }
    ],
    "total": 51.98
  }
}
```

> - `subtotal` de cada ítem = `unit_price × quantity`
> - `total` = suma de todos los subtotales
> - Si el carrito está vacío, devuelve `items: []` y `total: 0`

---

### 10.3 Actualizar cantidad de un ítem del carrito (HU7)

```
PATCH http://localhost:3000/api/v1/cart/items/:id
```

> Usar el `id` del ítem del carrito (no del producto). Lo obtienes del response de agregar o del GET del carrito.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body (raw JSON):**
```json
{
  "quantity": 5
}
```

**Respuesta esperada (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-del-item",
    "shop_id": "uuid-tienda",
    "user_id": "uuid-usuario",
    "product_id": "uuid-producto",
    "quantity": 5,
    "product_name": "Camiseta Básica Blanca",
    "unit_price": 25.99,
    "stock_available": 100,
    "updated_at": "2024-01-15T10:10:00.000Z"
  }
}
```

**Casos de error a probar:**

| Escenario | Qué cambiar | Código esperado |
|---|---|---|
| Cantidad mayor al stock | quantity: 99999 | 422 |
| Cantidad cero | quantity: 0 | 422 |
| Ítem inexistente | ID de ítem que no existe | 404 |
| ID malformado | `/cart/items/no-es-uuid` | 422 |

---

### 10.4 Eliminar ítem del carrito (HU7)

```
DELETE http://localhost:3000/api/v1/cart/items/:id
```

**Headers:**
```
Authorization: Bearer {{token}}
```

**Respuesta esperada (200):**
```json
{
  "success": true,
  "data": {
    "message": "Ítem eliminado del carrito"
  }
}
```

**Casos de error a probar:**

| Escenario | URL | Código esperado |
|---|---|---|
| Ítem inexistente | `/cart/items/00000000-0000-4000-8000-000000000000` | 404 |
| ID malformado | `/cart/items/no-es-uuid` | 422 |

---

## 11. Pruebas — Pedidos (HU8, HU9 y HU10)

> Los endpoints de pedidos requieren `Authorization: Bearer {{token}}`
> Crear pedido: cualquier rol autenticado.
> Listar pedidos y actualizar estado: solo `admin` y `owner`.

### 11.1 Finalizar compra / Crear pedido (HU8)

```
POST http://localhost:3000/api/v1/orders
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

#### Opción A — Desde el carrito (recomendado)

Si el usuario ya tiene productos en el carrito (sección 10), envía el body vacío o solo con campos opcionales:

**Body (raw JSON):**
```json
{}
```

O con opcionales:
```json
{
  "customer_id": "uuid-del-cliente",
  "notes": "Entregar antes de las 5pm"
}
```

> El sistema tomará automáticamente los ítems del carrito para crear el pedido.
> Al finalizar, el carrito se vacía automáticamente.

#### Opción B — Con ítems explícitos

Si prefieres enviar los ítems directamente sin usar el carrito:

**Body (raw JSON):**
```json
{
  "items": [
    {
      "product_id": "uuid-del-producto-1",
      "quantity": 2,
      "discount": 0
    },
    {
      "product_id": "uuid-del-producto-2",
      "quantity": 1,
      "discount": 5.00
    }
  ],
  "customer_id": "uuid-del-cliente",
  "notes": "Pedido urgente"
}
```

**Respuesta esperada (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-del-pedido",
    "shop_id": "uuid-tienda",
    "customer_id": null,
    "created_by": "uuid-del-usuario",
    "order_number": "ORD-2024-0001",
    "status": "pending",
    "subtotal": "51.98",
    "discount": "0.00",
    "tax": "0.00",
    "total": "51.98",
    "notes": null,
    "created_at": "2024-01-15T10:15:00.000Z",
    "updated_at": "2024-01-15T10:15:00.000Z",
    "customer_name": null,
    "items": [
      {
        "id": "uuid-item-orden",
        "shop_id": "uuid-tienda",
        "order_id": "uuid-del-pedido",
        "product_id": "uuid-del-producto",
        "quantity": 2,
        "unit_price": "25.99",
        "discount": "0.00",
        "subtotal": "51.98",
        "product_name": "Camiseta Básica Blanca",
        "product_sku": "CAM-001"
      }
    ]
  }
}
```

> **Verificaciones importantes tras crear un pedido:**
> 1. El `status` inicial siempre es `"pending"`
> 2. El `order_number` tiene formato `ORD-YYYY-NNNN` (ej: `ORD-2024-0001`)
> 3. El stock del producto se descuenta automáticamente — verificar con `GET /products/:id`
> 4. El carrito queda vacío — verificar con `GET /cart`
> 5. El `unit_price` es un snapshot del precio al momento de la compra

**Casos de error a probar:**

| Escenario | Qué hacer | Código esperado |
|---|---|---|
| Carrito vacío (sin ítems explícitos) | Enviar `{}` con carrito vacío | 422 |
| Producto inexistente en ítems | product_id inventado en items | 404 |
| Stock insuficiente | quantity mayor al stock disponible | 422 |
| Producto desactivado | product_id de un producto eliminado | 422 |
| Sin token | Quitar el header Authorization | 401 |

---

### 11.2 Listar pedidos (HU9)

> **Solo admin y owner** pueden listar todos los pedidos de la tienda.

```
GET http://localhost:3000/api/v1/orders
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
      "id": "uuid-pedido",
      "shop_id": "uuid-tienda",
      "customer_id": null,
      "created_by": "uuid-usuario",
      "order_number": "ORD-2024-0001",
      "status": "pending",
      "subtotal": "51.98",
      "discount": "0.00",
      "tax": "0.00",
      "total": "51.98",
      "notes": null,
      "created_at": "2024-01-15T10:15:00.000Z",
      "updated_at": "2024-01-15T10:15:00.000Z",
      "customer_name": null
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
| `status` | `?status=pending` | Filtrar por estado. Valores: `pending`, `confirmed`, `shipped`, `delivered`, `cancelled` |
| `customer_id` | `?customer_id=uuid` | Filtrar por cliente |
| `desde` | `?desde=2024-01-01T00:00:00.000Z` | Pedidos desde esta fecha (formato ISO 8601) |
| `hasta` | `?hasta=2024-12-31T23:59:59.000Z` | Pedidos hasta esta fecha (formato ISO 8601) |
| `page` | `?page=2` | Número de página |
| `limit` | `?limit=10` | Resultados por página (máximo 100) |

**Ejemplos de URL con filtros:**
```
GET http://localhost:3000/api/v1/orders?status=pending
GET http://localhost:3000/api/v1/orders?status=shipped&page=1&limit=5
GET http://localhost:3000/api/v1/orders?desde=2024-01-01T00:00:00.000Z&hasta=2024-06-30T23:59:59.000Z
GET http://localhost:3000/api/v1/orders?customer_id=uuid-del-cliente&status=delivered
```

**Casos de error a probar:**

| Escenario | Qué hacer | Código esperado |
|---|---|---|
| Sin token | Quitar header Authorization | 401 |
| Rol staff | Login con usuario staff | 403 |
| Estado inválido | `?status=invalido` | 422 |

---

### 11.3 Obtener detalle de un pedido

```
GET http://localhost:3000/api/v1/orders/:id
```

**Ejemplo:**
```
GET http://localhost:3000/api/v1/orders/uuid-del-pedido
```

**Headers:**
```
Authorization: Bearer {{token}}
```

**Respuesta esperada (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-del-pedido",
    "shop_id": "uuid-tienda",
    "customer_id": null,
    "created_by": "uuid-usuario",
    "order_number": "ORD-2024-0001",
    "status": "pending",
    "subtotal": "51.98",
    "discount": "0.00",
    "tax": "0.00",
    "total": "51.98",
    "notes": null,
    "created_at": "2024-01-15T10:15:00.000Z",
    "updated_at": "2024-01-15T10:15:00.000Z",
    "customer_name": null,
    "items": [
      {
        "id": "uuid-item",
        "shop_id": "uuid-tienda",
        "order_id": "uuid-del-pedido",
        "product_id": "uuid-producto",
        "quantity": 2,
        "unit_price": "25.99",
        "discount": "0.00",
        "subtotal": "51.98",
        "product_name": "Camiseta Básica Blanca",
        "product_sku": "CAM-001"
      }
    ]
  }
}
```

> El detalle incluye el array `items` con todos los productos de ese pedido.

**Casos de error a probar:**

| Escenario | URL | Código esperado |
|---|---|---|
| ID inexistente | `/orders/00000000-0000-4000-8000-000000000000` | 404 |
| ID malformado | `/orders/no-es-uuid` | 422 |
| Pedido de otra tienda | ID válido de otra tienda | 404 |

---

### 11.4 Actualizar estado del pedido (HU10)

> **Solo admin y owner** pueden cambiar el estado de un pedido.

```
PATCH http://localhost:3000/api/v1/orders/:id/estado
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body (raw JSON):**
```json
{
  "status": "confirmed"
}
```

O con nota opcional:
```json
{
  "status": "confirmed",
  "notes": "Verificado con el cliente por teléfono"
}
```

**Respuesta esperada (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-del-pedido",
    "status": "confirmed",
    "order_number": "ORD-2024-0001",
    "total": "51.98",
    "notes": "Verificado con el cliente por teléfono",
    "updated_at": "2024-01-15T10:20:00.000Z",
    "items": [...]
  }
}
```

#### Reglas de transición de estado

El sistema valida que los cambios de estado sigan un flujo lógico. **No todas las transiciones son válidas:**

| Estado actual | Puede cambiar a |
|---|---|
| `pending` | `confirmed`, `cancelled` |
| `confirmed` | `shipped`, `cancelled` |
| `shipped` | `delivered` |
| `delivered` | _(ninguno — estado final)_ |
| `cancelled` | _(ninguno — estado final)_ |

```
┌──────────┐    ┌───────────┐    ┌──────────┐    ┌───────────┐
│ pending  │───→│ confirmed │───→│ shipped  │───→│ delivered │
└──────────┘    └───────────┘    └──────────┘    └───────────┘
     │                │
     ▼                ▼
┌───────────┐   ┌───────────┐
│ cancelled │   │ cancelled │
└───────────┘   └───────────┘
```

**Secuencia de prueba completa para probar el flujo de estados:**

```
PASO 1 — Estado inicial → confirmed
  PATCH /orders/:id/estado  { "status": "confirmed" }
  → Esperar 200, status = "confirmed"

PASO 2 — Confirmed → shipped
  PATCH /orders/:id/estado  { "status": "shipped" }
  → Esperar 200, status = "shipped"

PASO 3 — Shipped → delivered
  PATCH /orders/:id/estado  { "status": "delivered" }
  → Esperar 200, status = "delivered"

PASO 4 — Delivered → (cualquier cambio)
  PATCH /orders/:id/estado  { "status": "pending" }
  → Esperar 422 (estado final, no se puede cambiar)
```

**Casos de error a probar:**

| Escenario | Body / Qué hacer | Código esperado |
|---|---|---|
| Transición inválida (pending → shipped) | `{ "status": "shipped" }` con pedido en pending | 422 |
| Transición inválida (delivered → pending) | `{ "status": "pending" }` con pedido delivered | 422 |
| Estado no reconocido | `{ "status": "inexistente" }` | 422 |
| Pedido inexistente | ID de pedido que no existe | 404 |
| Rol staff | Login con usuario staff | 403 |
| Sin token | Quitar header Authorization | 401 |

---

## 12. Flujo completo de prueba — Carrito y Pedidos (orden recomendado)

> **Requisito previo:** Haber completado los pasos 1–4 de la sección 8 (registrar tienda, login y crear productos).

```
PASO 1 — Verificar carrito vacío
  GET /cart
  → Esperar: { items: [], total: 0 }

PASO 2 — Agregar primer producto al carrito (HU6)
  POST /cart/items  { "product_id": "uuid-CAM-001", "quantity": 2 }
  → Esperar 201, guardar el id del ítem

PASO 3 — Agregar segundo producto al carrito
  POST /cart/items  { "product_id": "uuid-PAN-001", "quantity": 1 }
  → Esperar 201

PASO 4 — Ver carrito con los 2 productos (HU7)
  GET /cart
  → Esperar 2 ítems, total = (25.99 × 2) + (precio-pantalón × 1)

PASO 5 — Actualizar cantidad del primer ítem
  PATCH /cart/items/:id  { "quantity": 3 }
  → Esperar 200, quantity = 3

PASO 6 — Intentar agregar más cantidad que el stock
  POST /cart/items  { "product_id": "uuid-ZAP-001", "quantity": 99999 }
  → Esperar 422 (stock insuficiente)

PASO 7 — Agregar producto con stock justo
  POST /cart/items  { "product_id": "uuid-ZAP-001", "quantity": 3 }
  → Esperar 201

PASO 8 — Ver carrito final
  GET /cart
  → Esperar 3 ítems con subtotales y total correcto

PASO 9 — Eliminar un ítem del carrito
  DELETE /cart/items/:id  (el id de ZAP-001)
  → Esperar 200

PASO 10 — Verificar que solo quedan 2 ítems
  GET /cart
  → Esperar 2 ítems

PASO 11 — Finalizar compra desde carrito (HU8)
  POST /orders  {}
  → Esperar 201, status = "pending", order_number = "ORD-YYYY-0001"
  → Guardar el id del pedido creado

PASO 12 — Verificar que el carrito quedó vacío
  GET /cart
  → Esperar: { items: [], total: 0 }

PASO 13 — Verificar que el stock se descontó
  GET /products/uuid-CAM-001
  → Stock debe haber bajado en 3 unidades
  GET /products/uuid-PAN-001
  → Stock debe haber bajado en 1 unidad

PASO 14 — Listar pedidos como admin (HU9)
  GET /orders
  → Esperar al menos 1 pedido con order_number, total, status, fecha

PASO 15 — Filtrar pedidos por estado
  GET /orders?status=pending
  → Debe aparecer el pedido recién creado

PASO 16 — Ver detalle del pedido
  GET /orders/:id
  → Debe mostrar los ítems con product_name, quantity, unit_price, subtotal

PASO 17 — Confirmar pedido (HU10)
  PATCH /orders/:id/estado  { "status": "confirmed" }
  → Esperar 200, status = "confirmed"

PASO 18 — Enviar pedido
  PATCH /orders/:id/estado  { "status": "shipped" }
  → Esperar 200, status = "shipped"

PASO 19 — Intentar transición inválida
  PATCH /orders/:id/estado  { "status": "pending" }
  → Esperar 422 (no se puede volver de shipped a pending)

PASO 20 — Completar pedido
  PATCH /orders/:id/estado  { "status": "delivered" }
  → Esperar 200, status = "delivered"

PASO 21 — Intentar cambiar estado final
  PATCH /orders/:id/estado  { "status": "confirmed" }
  → Esperar 422 (delivered es estado final)

PASO 22 — Crear un segundo pedido y cancelarlo
  Agregar productos al carrito → POST /orders → 
  PATCH /orders/:id/estado  { "status": "cancelled" }
  → Esperar 200, status = "cancelled"

PASO 23 — Filtrar solo entregados
  GET /orders?status=delivered
  → Solo el primer pedido

PASO 24 — Filtrar solo cancelados
  GET /orders?status=cancelled
  → Solo el segundo pedido
```

---

## 13. Errores comunes — Carrito y Pedidos

### Carrito

**422 — Stock insuficiente**
```
Solución: La cantidad solicitada supera el stock disponible.
Verificar stock con GET /products/:id y ajustar la cantidad.
```

**404 — Producto no encontrado**
```
Posibles causas:
  1. El product_id no existe
  2. El producto fue desactivado (soft delete)
  3. El producto es de otra tienda
Solución: Verificar el ID con GET /products
```

**404 — Ítem del carrito no encontrado**
```
Posibles causas:
  1. El ID del ítem no existe
  2. El ítem pertenece a otro usuario
Solución: Verificar con GET /cart que el ítem existe
```

---

### Pedidos

**422 — El carrito está vacío**
```
Solución: Agregar productos al carrito antes de crear un pedido,
o enviar los ítems explícitamente en el body.
```

**422 — No se puede cambiar el estado**
```
El sistema valida transiciones de estado. Ejemplo:
  - pending solo puede ir a confirmed o cancelled
  - delivered y cancelled son estados finales
Solución: Revisar la tabla de transiciones válidas en la sección 11.4.
```

**403 — Insufficient permissions (en orders)**
```
Solución: Los endpoints GET /orders y PATCH /orders/:id/estado
requieren rol admin u owner. El rol staff no puede acceder.
Sin embargo, cualquier rol autenticado puede crear un pedido con POST /orders.
```

**404 — Pedido no encontrado**
```
Posibles causas:
  1. El ID del pedido no existe
  2. El pedido pertenece a otra tienda (multitenant)
Solución: Verificar el ID con GET /orders
```

---

## 14. Pruebas — Pasarela de Pago Mercado Pago

> La pasarela de pagos usa **Mercado Pago** como procesador.
> Soporta dos métodos: **tarjeta de crédito/débito** y **PSE** (transferencia bancaria Colombia).
> Para probar localmente se usa el **modo Sandbox** de Mercado Pago.

### 14.0 Requisitos previos — Configuración de Mercado Pago

#### Paso 1 — Crear cuenta de desarrollador

1. Ir a https://www.mercadopago.com.co/developers
2. Crear una cuenta o iniciar sesión
3. Ir a **Tus integraciones** → **Crear aplicación**
4. Seleccionar tipo: **Pagos online**
5. Seleccionar producto: **Checkout API**

#### Paso 2 — Obtener credenciales de prueba

1. En tu aplicación, ir a la sección **Credenciales de prueba**
2. Copiar el **Access Token de prueba** (empieza con `TEST-`)

> **IMPORTANTE:** Usar siempre el access token de **prueba** (TEST-...) para desarrollo.
> NUNCA usar el token de producción (APP_USR-...) en localhost.

#### Paso 3 — Agregar variable al .env

Agregar esta línea al archivo `.env`:

```env
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxxxxxxxxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxx
```

> Reiniciar el servidor después de agregar la variable (`npm run dev`).
> Si esta variable no existe, el servidor no arrancará.

#### Paso 4 — Crear usuarios de prueba

Mercado Pago requiere **usuarios de prueba** para simular pagos en sandbox.
Crear desde la API de MP en Postman:

```
POST https://api.mercadopago.com/users/test
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer TEST-tu-access-token
```

**Body:**
```json
{
  "site_id": "MCO",
  "description": "Comprador de prueba"
}
```

**Respuesta esperada (201):**
```json
{
  "id": 123456789,
  "nickname": "TETE1234567",
  "email": "test_user_12345678@testuser.com",
  "password": "qatest1234"
}
```

> Guardar el `email` — lo necesitarás como `payer.email` en las pruebas.

---

### 14.1 Pago con tarjeta de crédito / débito

```
POST http://localhost:3000/api/v1/payments/card
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

> **Requisito previo:** Tener un pedido creado (sección 11.1). Necesitas el `id` del pedido.

#### ¿Cómo obtener el `token` de la tarjeta?

El `token` es generado por el **SDK de Mercado Pago** en el frontend.
Para pruebas en Postman **sin frontend**, puedes generar un token de prueba usando la API de MP directamente:

```
POST https://api.mercadopago.com/v1/card_tokens?public_key=TU_PUBLIC_KEY
```

**Body:**
```json
{
  "card_number": "5031433215406351",
  "expiration_month": 11,
  "expiration_year": 2030,
  "security_code": "123",
  "cardholder": {
    "name": "APRO TEST",
    "identification": {
      "type": "CC",
      "number": "12345678"
    }
  }
}
```

> El `public_key` se obtiene de tu aplicación en MP → Credenciales de prueba.

#### Tarjetas de prueba de Mercado Pago (Colombia)

| Tarjeta | Número | Resultado |
|---|---|---|
| Mastercard | `5031 4332 1540 6351` | **Aprobado** |
| Visa | `4013 5406 8274 6260` | **Aprobado** |
| Mastercard | `5031 7557 3453 0604` | **Rechazado** (fondos insuficientes) |
| Visa | `4168 8188 4444 7115` | **Pendiente** |

> - CVV: cualquiera de 3 dígitos (ej: `123`)
> - Fecha expiración: cualquier fecha futura
> - Nombre del titular: `APRO` (aprobado), `OTHE` (rechazado), `CONT` (pendiente)

**Body del pago con tarjeta:**
```json
{
  "order_id": "uuid-del-pedido",
  "token": "token-generado-por-mp-sdk",
  "payment_method_id": "master",
  "installments": 1,
  "payer": {
    "email": "test_user_12345678@testuser.com",
    "identification": {
      "type": "CC",
      "number": "12345678"
    }
  }
}
```

**Campos opcionales:**
```json
{
  "description": "Pedido #ORD-2024-0001",
  "issuer_id": 204,
  "installments": 3
}
```

**Respuesta esperada — pago aprobado (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-del-pago",
    "shop_id": "uuid-tienda",
    "order_id": "uuid-del-pedido",
    "mp_payment_id": 3055677,
    "method": "card",
    "status": "approved",
    "status_detail": "accredited",
    "transaction_amount": "51.98",
    "external_resource_url": null,
    "raw_response": {
      "id": 3055677,
      "status": "approved",
      "status_detail": "accredited",
      "payment_method_id": "master",
      "payment_type_id": "credit_card",
      "date_approved": "2024-01-15T10:25:00.000-05:00",
      "...": "..."
    },
    "created_at": "2024-01-15T10:25:00.000Z",
    "updated_at": "2024-01-15T10:25:00.000Z"
  }
}
```

**Significado de los estados:**

| status | status_detail | Significado |
|---|---|---|
| `approved` | `accredited` | ✅ Pago aprobado y acreditado |
| `rejected` | `cc_rejected_insufficient_amount` | ❌ Fondos insuficientes |
| `rejected` | `cc_rejected_bad_filled_security_code` | ❌ CVV incorrecto |
| `rejected` | `cc_rejected_bad_filled_date` | ❌ Fecha de expiración incorrecta |
| `rejected` | `cc_rejected_other_reason` | ❌ Rechazado por otra razón |
| `in_process` | `pending_contingency` | ⏳ En revisión |
| `pending` | `pending_review_manual` | ⏳ Revisión manual |

**Casos de error a probar:**

| Escenario | Qué hacer | Código esperado |
|---|---|---|
| Pedido inexistente | order_id inventado | 404 |
| Pedido cancelado | order_id de pedido con status "cancelled" | 422 |
| Pedido ya pagado | Mismo order_id de un pago aprobado | 422 |
| Token vacío | token: "" | 422 |
| Email inválido | payer.email: "no-es-email" | 422 |
| Sin token JWT | Quitar Authorization header | 401 |
| Token de tarjeta inválido | token: "token-falso" | Error de Mercado Pago |

---

### 14.2 Pago por PSE (transferencia bancaria)

```
POST http://localhost:3000/api/v1/payments/pse
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body (raw JSON):**
```json
{
  "order_id": "uuid-del-pedido",
  "financial_institution": "1009",
  "callback_url": "http://www.tu-sitio.com/pago-resultado",
  "payer": {
    "email": "test_user_12345678@testuser.com",
    "first_name": "Juan",
    "last_name": "Pérez",
    "entity_type": "individual",
    "identification": {
      "type": "CC",
      "number": "12345678"
    },
    "address": {
      "zip_code": "110111",
      "street_name": "Calle 100",
      "street_number": "14",
      "neighborhood": "Usaquén",
      "city": "Bogotá",
      "federal_unit": "Bogotá D.C."
    },
    "phone": {
      "area_code": "57",
      "number": "3001234567"
    }
  }
}
```

**Campos opcionales:**
```json
{
  "description": "Pedido #ORD-2024-0001",
  "notification_url": "https://tu-dominio.com/api/v1/payments/webhook"
}
```

#### Códigos de bancos para PSE (Colombia)

| Código | Banco |
|---|---|
| `1007` | Bancolombia |
| `1009` | Davivienda |
| `1013` | BBVA |
| `1019` | Scotiabank Colpatria |
| `1023` | Banco de Occidente |
| `1040` | Banco Agrario |
| `1051` | Banco Popular |
| `1052` | Banco AV Villas |
| `1062` | Banco Falabella |

> Para obtener la lista completa actualizada, consultar:
> `GET https://api.mercadopago.com/v1/payment_methods?public_key=TU_PUBLIC_KEY`
> Filtrar por `payment_type_id: "bank_transfer"`

**Respuesta esperada — PSE (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-del-pago",
    "shop_id": "uuid-tienda",
    "order_id": "uuid-del-pedido",
    "mp_payment_id": 1312147735,
    "method": "pse",
    "status": "pending",
    "status_detail": "pending_waiting_transfer",
    "transaction_amount": "51.98",
    "external_resource_url": "https://www.mercadopago.com.co/sandbox/payments/1312147735/bank_transfer?caller_id=...",
    "raw_response": {
      "id": 1312147735,
      "status": "pending",
      "status_detail": "pending_waiting_transfer",
      "payment_method_id": "pse",
      "payment_type_id": "bank_transfer",
      "transaction_details": {
        "total_paid_amount": 51.98,
        "external_resource_url": "https://www.mercadopago.com.co/sandbox/payments/...",
        "financial_institution": "1009",
        "bank_transfer_id": 129229,
        "transaction_id": "10022214"
      },
      "...": "..."
    },
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

> **IMPORTANTE sobre PSE:**
> 1. El `status` inicial siempre es `"pending"` (esperando transferencia)
> 2. El `external_resource_url` es la URL donde el usuario debe completar el pago en el banco
> 3. En **sandbox**, esta URL redirige a una página de simulación de MP
> 4. El estado se actualiza vía **webhook** cuando el banco confirma la transferencia

**Casos de error a probar:**

| Escenario | Qué hacer | Código esperado |
|---|---|---|
| Pedido inexistente | order_id inventado | 404 |
| Pedido cancelado | order_id de pedido cancelado | 422 |
| Pedido ya pagado | order_id con pago aprobado | 422 |
| Sin financial_institution | Quitar el campo | 422 |
| callback_url inválida | callback_url: "no-es-url" | 422 |
| Email vacío | payer.email: "" | 422 |
| Tipo de identificación inválido | identification.type: "XX" | 422 |
| Sin datos de dirección | Quitar payer.address | 422 |
| Sin token JWT | Quitar Authorization header | 401 |

---

### 14.3 Webhook de Mercado Pago

```
POST http://localhost:3000/api/v1/payments/webhook
```

> **Este endpoint NO requiere autenticación JWT.** Es llamado directamente por Mercado Pago.
> Siempre responde **200** (incluso si hay error), para evitar reintentos infinitos de MP.

#### ¿Cómo funciona?

1. Cuando un pago cambia de estado (ej: PSE pasa de `pending` a `approved`), Mercado Pago envía una notificación al webhook
2. El backend recibe la notificación, consulta la API de MP para verificar el estado real
3. Actualiza el estado del pago en la base de datos

#### Para probar en Postman (simular lo que haría Mercado Pago):

**Headers:**
```
Content-Type: application/json
```

> NO agregar Authorization — el webhook no usa JWT.

**Body — notificación de pago:**
```json
{
  "type": "payment",
  "action": "payment.updated",
  "data": {
    "id": 3055677
  }
}
```

> Usar el `mp_payment_id` que recibiste al crear el pago.

**Respuesta esperada (200):**
```json
{
  "success": true,
  "data": {
    "procesado": true
  }
}
```

**Body — notificación ignorada (no es tipo payment):**
```json
{
  "type": "plan",
  "data": {
    "id": "123"
  }
}
```

**Respuesta esperada (200):**
```json
{
  "success": true,
  "data": {
    "procesado": true
  }
}
```

> Solo se procesan notificaciones con `type: "payment"`. Las demás se ignoran silenciosamente.

**Body — formato inválido:**
```json
{
  "cualquier": "cosa"
}
```

**Respuesta esperada (200):**
```json
{
  "success": true,
  "data": {
    "ignored": true
  }
}
```

> El webhook NUNCA devuelve error HTTP. Esto es por diseño — si se devuelve un error,
> Mercado Pago reintentaría la notificación indefinidamente.

#### Configurar el webhook en producción

Para que Mercado Pago envíe notificaciones reales:

1. Ir a https://www.mercadopago.com.co/developers → Tu aplicación
2. Ir a **Webhooks** → **Configurar notificaciones**
3. URL de producción: `https://tu-dominio.com/api/v1/payments/webhook`
4. Eventos: seleccionar **Payments**
5. Para desarrollo local: usar un servicio como **ngrok** para exponer localhost:
   ```bash
   npx ngrok http 3000
   ```
   Esto genera una URL como `https://abc123.ngrok.io` que puedes configurar en MP.

---

### 14.4 Tipos de identificación válidos

El campo `payer.identification.type` solo acepta estos valores (Colombia):

| Tipo | Descripción |
|---|---|
| `CC` | Cédula de Ciudadanía |
| `CE` | Cédula de Extranjería |
| `NIT` | Número de Identificación Tributaria |
| `PP` | Pasaporte |
| `TI` | Tarjeta de Identidad |

---

### 14.5 Flujo completo de prueba — Pagos (orden recomendado)

> **Requisito previo:** Haber creado un pedido (sección 11.1) y tener las credenciales de MP.

```
─── FLUJO A: Pago con tarjeta ───────────────────────────────────────

PASO 1 — Crear un pedido
  POST /orders  (con ítems en carrito o explícitos)
  → Guardar el id del pedido

PASO 2 — Generar token de tarjeta de prueba
  POST https://api.mercadopago.com/v1/card_tokens?public_key=TU_PUBLIC_KEY
  Body: tarjeta de prueba Mastercard 5031 4332 1540 6351
  → Guardar el token

PASO 3 — Pagar con tarjeta
  POST /payments/card
  Body: { order_id, token, payment_method_id: "master", payer: {...} }
  → Esperar 201, status = "approved"

PASO 4 — Verificar que el pago quedó registrado
  Revisar en Supabase: SELECT * FROM payments WHERE order_id = 'uuid';

PASO 5 — Intentar pagar el mismo pedido otra vez
  POST /payments/card  (mismo order_id)
  → Esperar 422 ("Este pedido ya fue pagado")

─── FLUJO B: Pago por PSE ──────────────────────────────────────────

PASO 6 — Crear otro pedido
  POST /orders  → Guardar el id

PASO 7 — Pagar con PSE
  POST /payments/pse
  Body: { order_id, financial_institution: "1009", callback_url, payer: {...} }
  → Esperar 201, status = "pending"
  → Guardar el external_resource_url y el mp_payment_id

PASO 8 — Abrir la URL de PSE en el navegador (sandbox)
  Abrir external_resource_url en el navegador
  → En sandbox MP permite simular aprobación/rechazo

PASO 9 — Simular webhook de MP (si no llega automáticamente)
  POST /payments/webhook
  Body: { "type": "payment", "data": { "id": mp_payment_id } }
  → Esperar 200

PASO 10 — Verificar que el estado se actualizó
  Revisar en Supabase: SELECT status, status_detail FROM payments WHERE mp_payment_id = ...;

─── FLUJO C: Errores esperados ─────────────────────────────────────

PASO 11 — Pagar pedido cancelado
  Crear pedido → Cambiar estado a cancelled → POST /payments/card
  → Esperar 422

PASO 12 — Pagar con tarjeta rechazada
  Generar token con tarjeta 5031 7557 3453 0604 (nombre: OTHE)
  POST /payments/card
  → Esperar 201 con status = "rejected"

PASO 13 — Enviar webhook con formato inválido
  POST /payments/webhook  { "random": "data" }
  → Esperar 200 con ignored: true
```

---

## 15. Errores comunes — Pagos

**Error al arrancar: Missing required environment variable: MERCADOPAGO_ACCESS_TOKEN**
```
Solución: Agregar MERCADOPAGO_ACCESS_TOKEN al archivo .env
Formato: TEST-xxxxx-xxxxx-xxxxx (modo sandbox)
Reiniciar el servidor después de agregar la variable.
```

**422 — No se puede pagar un pedido cancelado**
```
Solución: El pedido tiene status "cancelled".
No se pueden procesar pagos para pedidos cancelados.
Crear un nuevo pedido.
```

**422 — Este pedido ya fue pagado**
```
Solución: Ya existe un pago con status "approved" para este pedido.
Un pedido solo puede pagarse una vez.
Verificar en Supabase: SELECT * FROM payments WHERE order_id = 'uuid';
```

**Error de Mercado Pago — Token inválido**
```
Posibles causas:
  1. El token de tarjeta expiró (duran ~7 minutos)
  2. El token ya fue usado (son de un solo uso)
  3. El public_key no corresponde al access_token
Solución: Generar un nuevo token de tarjeta antes de cada pago.
```

**Error de Mercado Pago — Pago rechazado**
```
No es un error del backend — el pago fue procesado correctamente pero
el banco/emisor lo rechazó. Revisar el campo status_detail:
  - cc_rejected_insufficient_amount → fondos insuficientes
  - cc_rejected_bad_filled_security_code → CVV incorrecto
  - cc_rejected_bad_filled_date → fecha de expiración incorrecta
Solución: En ambiente de prueba, usar tarjeta con nombre APRO para aprobación.
```

**Webhook no llega en desarrollo local**
```
Solución: Mercado Pago no puede enviar webhooks a localhost.
Opción 1: Usar ngrok → npx ngrok http 3000
  Configurar la URL ngrok como webhook en MP developers.
Opción 2: Simular manualmente con POST /payments/webhook en Postman.
```

**404 — Pedido no encontrado (al pagar)**
```
Posibles causas:
  1. El order_id no existe
  2. El pedido pertenece a otra tienda
Solución: Verificar el ID con GET /orders/:id
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
| GET | `/api/v1/cart` | Sí | staff |
| POST | `/api/v1/cart/items` | Sí | staff |
| PATCH | `/api/v1/cart/items/:id` | Sí | staff |
| DELETE | `/api/v1/cart/items/:id` | Sí | staff |
| POST | `/api/v1/orders` | Sí | staff |
| GET | `/api/v1/orders` | Sí | admin |
| GET | `/api/v1/orders/:id` | Sí | staff |
| PATCH | `/api/v1/orders/:id/estado` | Sí | admin |
| POST | `/api/v1/payments/card` | Sí | staff |
| POST | `/api/v1/payments/pse` | Sí | staff |
| POST | `/api/v1/payments/webhook` | **No** | — |
