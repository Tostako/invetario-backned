# Guía de Referencia para Desarrollo Frontend — Inventario SaaS

Esta guía detalla cada endpoint con sus parámetros (requeridos y opcionales) y ejemplos de JSON para facilitar la integración del frontend.

---

## 🛠️ CONFIGURACIÓN INICIAL

- **Base URL:** `http://localhost:3000/api/v1`
- **Imágenes:** Gestionadas vía **Supabase Storage** (Bucket: `product-images`).

### 🛠️ CONFIGURACIÓN DE SUPABASE STORAGE
Para que las imágenes funcionen:
1. Ir a **Supabase Dashboard -> Storage**.
2. Crear un nuevo **Bucket** llamado `product-images`.
3. Marcar el bucket como **Public**.
4. Añadir las variables `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` en tu `.env`.

---

## 🔐 SECCIÓN 1: Autenticación

### 1.1 Registro de Nueva Tienda (Owner)
Crea una tienda y el usuario administrador inicial.
- **URL:** `POST /auth/register`
- **Body (JSON):**
```json
{
  "shop_name": "Mi Tienda Express",
  "shop_slug": "tienda-express",
  "shop_email": "admin@tiendaexpress.com",
  "owner_name": "Juan Pérez",
  "owner_email": "juan@perez.com",
  "password": "PasswordSegura123"
}
```

### 1.2 Login Paso 1: Autenticación Inicial
Valida credenciales y devuelve las tiendas asociadas al usuario.
- **URL:** `POST /auth/login`
- **Body (JSON):**
```json
{
  "email": "juan@perez.com",
  "password": "PasswordSegura123"
}
```
- **Respuesta (Success):** Devuelve un `token` temporal y la lista de `shops`.
```json
{
  "success": true,
  "data": {
    "token": "JWT_TEMPORAL...",
    "shops": [
      {
        "shop_id": "uuid-1",
        "shop_name": "Mi Tienda Express",
        "shop_slug": "tienda-express",
        "role": "owner"
      }
    ]
  }
}
```

### 1.3 Login Paso 2: Selección de Tienda
Obtiene el token definitivo con el contexto de la tienda elegida.
- **URL:** `POST /auth/select-shop`
- **Headers:** `Authorization: Bearer {{token_temporal}}`
- **Body (JSON):**
```json
{
  "shop_id": "uuid-1"
}
```

### 1.4 Autenticación de Clientes (Customers)
Los clientes finales tienen sus propios endpoints de login.
- **Registro:** `POST /auth/customer/register`
```json
{
  "name": "Maria Garcia",
  "email": "maria@cliente.com",
  "password": "clave123",
  "shop_slug": "tienda-express",
  "phone": "3001234567",
  "address": "Calle 10 # 20-30"
}
```
- **Login:** `POST /auth/customer/login`
```json
{
  "email": "maria@cliente.com",
  "password": "clave123",
  "shop_slug": "tienda-express"
}
```

---

## 🛍️ SECCIÓN 2: Productos y Categorías

### 2.1 Listar Productos
- **URL:** `GET /products`
- **Query Params (Opcionales):**
  - `search`: Texto para buscar en nombre o SKU.
  - `category_id`: Filtrar por UUID de categoría.
  - `low_stock`: `true` para ver solo productos con stock <= stock_min.
  - `page`: Número de página (default: 1).
  - `limit`: Resultados por página (default: 20).

### 2.2 Crear Producto (Multipart)
- **URL:** `POST /products`
- **Headers:** `Content-Type: multipart/form-data`
- **Body (Form-Data):**
  - `sku` (string, req), `name` (string, req), `price` (number, req)
  - `stock`, `stock_min`, `stock_max`, `description`, `category_id`, `supplier_id` (opcionales)
  - `image` (Archivo: jpg, png, webp)

### 2.3 Obtener Producto por ID
- **URL:** `GET /products/:id`

### 2.4 Editar Producto
- **URL:** `PATCH /products/:id`
- **Body:** Solo envía los campos a modificar. Soporta `image` vía FormData.

### 2.5 Ajuste de Stock
- **URL:** `PATCH /products/:id/stock`
- **Body:** `{ "delta": 10, "notas": "Reabastecimiento" }`

### 2.6 Eliminar Producto (Desactivación)
- **URL:** `DELETE /products/:id`

### 2.7 Gestión de Categorías
- **Listar:** `GET /categories`
- **Crear:** `POST /categories`
```json
{
  "name": "Electrónica",
  "description": "Gadgets y componentes",
  "is_active": true,
  "parent_id": null
}
```
- **Editar:** `PATCH /categories/:id`
- **Eliminar:** `DELETE /categories/:id`

---

## 🛒 SECCIÓN 3: Carrito de Compras (Solo Customers)

### 3.1 Agregar/Actualizar ítem
- **URL:** `POST /cart/items`
- **Body:** `{ "product_id": "uuid", "quantity": 2 }`
  - Si el producto ya está, **suma** la cantidad.

### 3.2 Ver Carrito
- **URL:** `GET /cart`
- **Respuesta:** `{ "items": [...], "total": 150.50 }`

### 3.3 Actualizar Cantidad Directa
- **URL:** `PATCH /cart/items/:id`
- **Body:** `{ "quantity": 5 }`

### 3.4 Eliminar del Carrito
- **URL:** `DELETE /cart/items/:id`

---

## 📦 SECCIÓN 4: Pedidos (Orders)

### 4.1 Crear Pedido
- **URL:** `POST /orders`
- **Opción A (Desde Carrito):** Body `{ "notes": "Entregar tarde" }`
- **Opción B (Manual):**
```json
{
  "items": [{ "product_id": "uuid", "quantity": 1 }],
  "customer_id": "uuid",
  "notes": "Pedido manual"
}
```

### 4.2 Listar Pedidos
- **URL:** `GET /orders`
- **Filtros (Query):** `status` (pending, confirmed, shipped, delivered, cancelled), `customer_id`, `desde`, `hasta`.

### 4.3 Actualizar Estado (Admin)
- **URL:** `PATCH /orders/:id/estado`
- **Body:** `{ "status": "confirmed", "notes": "Pago recibido" }`

---

## 💳 SECCIÓN 5: Pagos (Mercado Pago)

### 5.1 Pago con Tarjeta
- **URL:** `POST /payments/card`
- **Body:**
```json
{
  "order_id": "uuid",
  "token": "card_token_from_mp_sdk",
  "payment_method_id": "visa",
  "installments": 1,
  "payer": { "email": "test@test.com" }
}
```

### 5.2 Pago con PSE
- **URL:** `POST /payments/pse`
- **Body:**
```json
{
  "order_id": "uuid",
  "financial_institution": "1009",
  "callback_url": "https://mi-frontend.com/pago-exitoso",
  "payer": { "email": "test@test.com", "first_name": "Juan", "last_name": "Perez" }
}
```
- **Respuesta:** Incluye `external_resource_url` para redirigir al banco.

---

## 🛡️ SECCIÓN 6: Superadmin (Panel Global)

### 6.1 Bootstrap e Inicio
- **Bootstrap:** `POST /admin/auth/bootstrap` (Solo si no hay superadmins)
- **Login:** `POST /admin/auth/login`

### 6.2 Gestión de Tiendas
- **Listar:** `GET /admin/shops`
- **Crear Tienda + Owner:** `POST /admin/shops`
```json
{
  "name": "Tienda Central",
  "slug": "tienda-central",
  "email": "central@tienda.com",
  "plan": "pro",
  "owner_name": "Admin Pro",
  "owner_email": "pro@tienda.com",
  "owner_password": "Password123"
}
```

---

## ⚠️ SECCIÓN 7: Referencia de Errores

| Código | Significado |
|---|---|
| **401** | Unauthorized: Token inválido, expirado o falta el Bearer. |
| **403** | Forbidden: No tienes permisos para esta acción o tienda. |
| **404** | Not Found: El recurso no existe o es de otra tienda. |
| **409** | Conflict: El SKU o Slug ya existen. |
| **422** | Validation Error: Revisa el array `errors` en la respuesta. |

---

## 🧪 Notas para Testing en Postman

1. **Variables de Entorno:** Configura `base_url` y `token`.
2. **Scripts de Test:** Usa scripts para guardar el token automáticamente:
```js
const res = pm.response.json();
if (res.success && res.data.token) {
    pm.environment.set("token", res.data.token);
}
```
