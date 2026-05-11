# Documentacion de endpoints para frontend

Backend Express multitenant para inventario, tienda, carrito, pedidos y pagos.

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
- **Autenticacion:** las rutas protegidas usan header `Authorization: Bearer <token>`.
- **Roles:** `superadmin`, `owner`, `admin`, `staff`, `customer`.
- **Tenant:** para usuarios de tienda y clientes, el `shop_id` viene dentro del JWT. El frontend no debe mandarlo en cada request.

## Division funcional del proyecto

El backend tiene dos experiencias principales que el frontend debe tratar como modulos separados:

### A. Inventario y administracion de tienda
Es la parte interna para `owner`, `admin` y `staff`.

- Gestiona categorias.
- Gestiona productos e inventario.
- Permite subir imagenes de productos.
- Ajusta stock.
- Lista y administra pedidos.
- Cambia estados de pedidos.

### B. Tienda online para clientes
Es la parte publica/autenticada para `customer`.

- Permite registro/login de clientes.
- Muestra catalogo de productos disponibles.
- Maneja carrito de compras.
- Crea pedidos desde el carrito.
- Procesa pagos con Mercado Pago.

Las rutas pueden compartir endpoints como `GET /products` o `GET /categories`, pero la interfaz debe separarlas: en inventario se usan para administrar, y en tienda online se usan para mostrar catalogo al cliente.

## Fase 1: Base, health check y autenticacion

### 1.1 Health Check
Verifica que el backend este activo.

- **URL:** `GET /health`
- **Auth:** No requiere token.
- **Body:** No aplica.
- **Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-05-09T20:00:00.000Z"
  }
}
```

### 1.2 Registro de Nueva Tienda (Owner)
Crea una tienda y el usuario administrador inicial con rol `owner`.

- **URL:** `POST /api/v1/auth/register`
- **Auth:** No requiere token.
- **Body (JSON):**
```json
{
  "shop_name": "Mi Tienda Express",
  "shop_slug": "tienda-express",
  "shop_email": "admin@tiendaexpress.com",
  "owner_name": "Juan Perez",
  "owner_email": "juan@perez.com",
  "password": "PasswordSegura123"
}
```
- **Validaciones importantes:**
  - `shop_slug`: solo minusculas, numeros y guiones.
  - `password`: minimo 8, maximo 72 caracteres.
- **Respuesta:** devuelve `token`, `shopId` y `userId`.
- **Frontend:** guardar token y entrar directo al panel de la tienda.

### 1.3 Login de Usuario Interno
Inicia sesion para usuarios `owner`, `admin` o `staff`. Si el email existe en varias tiendas, devuelve las tiendas disponibles y un token temporal.

- **URL:** `POST /api/v1/auth/login`
- **Auth:** No requiere token.
- **Body (JSON):**
```json
{
  "email": "juan@perez.com",
  "password": "PasswordSegura123"
}
```
- **Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-temporal",
    "shops": [
      {
        "shop_id": "uuid",
        "shop_name": "Mi Tienda Express",
        "shop_slug": "tienda-express",
        "role": "owner"
      }
    ]
  }
}
```
- **Frontend:** si hay una tienda, puede llamar automaticamente a seleccion de tienda. Si hay varias, mostrar selector.

### 1.4 Seleccionar Tienda
Convierte el token temporal del login en un token final con `shop_id` y rol.

- **URL:** `POST /api/v1/auth/select-shop`
- **Auth:** Requiere token temporal en `Authorization`.
- **Body (JSON):**
```json
{
  "shop_id": "11111111-1111-1111-1111-111111111111"
}
```
- **Respuesta:** devuelve `token` final y datos del usuario.
- **Frontend:** reemplazar el token temporal por este token final.

### 1.5 Registro de Cliente
Registra un cliente dentro de una tienda por `shop_slug`.

- **URL:** `POST /api/v1/auth/customer/register`
- **Auth:** No requiere token.
- **Body (JSON):**
```json
{
  "name": "Maria Cliente",
  "email": "maria@email.com",
  "password": "123456",
  "phone": "3001234567",
  "address": "Calle 123",
  "shop_slug": "tienda-express"
}
```
- **Validaciones importantes:**
  - `password`: minimo 6, maximo 72 caracteres.
  - `email`: unico dentro de la misma tienda.
- **Respuesta:** devuelve `token`, `shopId` y `customerId`.

### 1.6 Login de Cliente
Inicia sesion para compras, carrito, pedidos y pagos del cliente.

- **URL:** `POST /api/v1/auth/customer/login`
- **Auth:** No requiere token.
- **Body (JSON):**
```json
{
  "email": "maria@email.com",
  "password": "123456",
  "shop_slug": "tienda-express"
}
```
- **Respuesta:** devuelve `token` y datos del cliente.

## Fase 2: Inventario y administracion de tienda

Esta fase corresponde al panel interno de la tienda. Aqui trabajan `owner`, `admin` y `staff` segun permisos. Incluye categorias, productos, subida de imagenes, stock y pedidos administrativos.

### 2.1 Listar Categorias
Lista categorias de la tienda autenticada. En inventario sirve para administrar categorias; en tienda online tambien puede reutilizarse para filtros de catalogo.

- **URL:** `GET /api/v1/categories`
- **Auth:** Requiere token.
- **Roles:** cualquier usuario autenticado de la tienda.
- **Query params:**
  - `is_active`: `true` o `false` opcional.
  - `page`: numero de pagina, default `1`.
  - `limit`: elementos por pagina, default `20`, maximo `100`.
- **Ejemplo:** `GET /api/v1/categories?is_active=true&page=1&limit=20`
- **Body:** No aplica.
- **Respuesta:** lista paginada de categorias.

### 2.2 Obtener Categoria
Obtiene una categoria por UUID.

- **URL:** `GET /api/v1/categories/:id`
- **Auth:** Requiere token.
- **Roles:** cualquier usuario autenticado de la tienda.
- **Body:** No aplica.

### 2.3 Crear Categoria
Crea una categoria o subcategoria.

- **URL:** `POST /api/v1/categories`
- **Auth:** Requiere token.
- **Roles:** `admin`, `owner`.
- **Body (JSON):**
```json
{
  "name": "Bebidas",
  "description": "Productos liquidos",
  "is_active": true,
  "parent_id": null
}
```
- **Notas:**
  - `parent_id` es opcional y debe ser UUID si se envia.
  - La base de datos evita nombres duplicados dentro del mismo padre y tienda.

### 2.4 Actualizar Categoria
Actualiza parcialmente una categoria. Tambien puede actualizar la imagen si se envia como `multipart/form-data`.

- **URL:** `PATCH /api/v1/categories/:id`
- **Auth:** Requiere token.
- **Roles:** `admin`, `owner`.
- **Content-Type:** `application/json` para solo datos, o `multipart/form-data` si tambien se envia imagen.
- **Campo de archivo para imagen:** `image`.
- **Destino de la imagen:** Supabase Storage, bucket `category-images`.
- **Resultado:** el backend guarda la URL publica en `image_url`.
- **Body JSON para solo datos:**
```json
{
  "name": "Bebidas frias",
  "description": "Bebidas refrigeradas",
  "is_active": true
}
```
- **Ejemplo con `multipart/form-data`:**
```text
name=Bebidas frias
description=Bebidas refrigeradas
is_active=true
image=<archivo .jpg/.png/.webp>
```
- **Nota importante:** si el frontend manda la imagen a esta ruta, debe usar `FormData` y el nombre exacto del campo debe ser `image`.

### 2.5 Subir o reemplazar imagen de Categoria
Actualiza solamente la imagen de una categoria.

- **URL:** `PATCH /api/v1/categories/:id/image`
- **Auth:** Requiere token.
- **Roles:** `admin`, `owner`.
- **Content-Type:** `multipart/form-data`.
- **Campo de archivo:** `image`.
- **Ejemplo:**
```text
image=<archivo .jpg/.png/.webp>
```
- **Requisitos backend:**
  - Debe existir el bucket de Supabase Storage `category-images`.
  - Debe estar aplicada la migracion `database/26_categories_images.sql` para que exista `categories.image_url`.

### 2.6 Eliminar Categoria
Desactiva una categoria con soft delete.

- **URL:** `DELETE /api/v1/categories/:id`
- **Auth:** Requiere token.
- **Roles:** `owner`.
- **Body:** No aplica.
- **Regla:** no permite eliminar si tiene productos activos asociados.

### 2.7 Listar Productos
Lista productos de la tienda autenticada con filtros. En inventario sirve para tabla administrativa, busqueda, filtros y alertas de bajo stock.

- **URL:** `GET /api/v1/products`
- **Auth:** Requiere token.
- **Roles:** cualquier usuario autenticado de la tienda.
- **Query params:**
  - `search`: busca por nombre o SKU.
  - `category_id`: UUID opcional.
  - `supplier_id`: UUID opcional.
  - `low_stock`: `true` para stock menor o igual a `stock_min`.
  - `is_active`: `true` o `false`.
  - `page`: default `1`.
  - `limit`: default `20`, maximo `100`.
- **Ejemplo:** `GET /api/v1/products?search=arroz&low_stock=false&page=1&limit=20`
- **Body:** No aplica.

### 2.8 Obtener Producto
Obtiene detalle de producto.

- **URL:** `GET /api/v1/products/:id`
- **Auth:** Requiere token.
- **Roles:** cualquier usuario autenticado de la tienda.
- **Body:** No aplica.

### 2.9 Crear Producto
Crea un producto. Este endpoint documenta explicitamente la subida de imagenes.

- **URL:** `POST /api/v1/products`
- **Auth:** Requiere token.
- **Roles:** `admin`, `owner`.
- **Content-Type:** `multipart/form-data` si se envia imagen, o `application/json` si no.
- **Campo de archivo para imagen:** `image`.
- **Destino de la imagen:** Supabase Storage, bucket `product-images`.
- **Resultado:** el backend guarda la URL publica en `image_url`.
- **Body (JSON o campos form-data):**
```json
{
  "sku": "ARROZ-001",
  "name": "Arroz Diana 500g",
  "description": "Arroz blanco",
  "category_id": "22222222-2222-2222-2222-222222222222",
  "supplier_id": "33333333-3333-3333-3333-333333333333",
  "price": 4500,
  "cost": 3200,
  "stock": 30,
  "stock_min": 5,
  "stock_max": 100,
  "unit": "unidad"
}
```
- **Ejemplo con `multipart/form-data`:**
```text
sku=ARROZ-001
name=Arroz Diana 500g
price=4500
stock=30
stock_min=5
unit=unidad
image=<archivo .jpg/.png/.webp>
```
- **Notas:**
  - Si se sube imagen, el backend la guarda en Supabase Storage y llena `image_url`.
  - Si no se sube imagen, se puede enviar `image_url` manualmente en JSON.
  - El SKU se normaliza a mayusculas en base de datos.
  - `stock_max` debe ser mayor que `stock_min`.

### 2.10 Actualizar Producto
Actualiza parcialmente un producto. Tambien permite cambiar o reemplazar la imagen.

- **URL:** `PATCH /api/v1/products/:id`
- **Auth:** Requiere token.
- **Roles:** `admin`, `owner`.
- **Content-Type:** `multipart/form-data` o `application/json`.
- **Campo de archivo para imagen:** `image`.
- **Resultado si se envia imagen:** el backend sube el archivo a Supabase Storage y reemplaza `image_url` por la nueva URL publica.
- **Body (JSON o campos form-data):**
```json
{
  "name": "Arroz Diana 500g actualizado",
  "price": 4800,
  "stock_min": 8
}
```
- **Ejemplo con cambio de imagen:**
```text
name=Arroz Diana 500g actualizado
price=4800
image=<nuevo archivo .jpg/.png/.webp>
```

### 2.11 Eliminar Producto
Desactiva un producto con soft delete.

- **URL:** `DELETE /api/v1/products/:id`
- **Auth:** Requiere token.
- **Roles:** `owner`.
- **Body:** No aplica.

### 2.12 Ajustar Stock
Ajusta stock manualmente y registra movimiento de inventario.

- **URL:** `PATCH /api/v1/products/:id/stock`
- **Auth:** Requiere token.
- **Roles:** `staff`, `admin`, `owner`.
- **Body (JSON):**
```json
{
  "delta": 10,
  "notas": "Compra a proveedor"
}
```
- **Notas:**
  - `delta` debe ser entero distinto de cero.
  - Positivo suma stock, negativo descuenta stock.
  - La base de datos impide que el stock quede negativo.

## Fase 3: Tienda online para clientes

Esta fase corresponde a la tienda que ve el cliente final. Incluye catalogo, carrito, checkout y pagos. El inventario interno y la tienda online deben ser pantallas separadas aunque usen algunos endpoints comunes.

### 3.1 Catalogo publico/autenticado de productos
Para mostrar productos en la tienda online se reutiliza el endpoint de productos.

- **URL:** `GET /api/v1/products`
- **Auth:** Requiere token.
- **Roles:** `customer` o cualquier usuario autenticado de la tienda.
- **Uso frontend:** grilla/lista de productos para comprar.
- **Query sugeridos:** `search`, `category_id`, `is_active=true`, `page`, `limit`.

### 3.2 Categorias para filtros de tienda
Para filtros del catalogo de cliente se reutiliza el endpoint de categorias.

- **URL:** `GET /api/v1/categories?is_active=true`
- **Auth:** Requiere token.
- **Uso frontend:** menu de categorias o filtros.

Estas rutas solo funcionan para tokens con rol `customer`. Aunque la ruta esta autenticada, el controller bloquea usuarios internos porque no tienen `customer_id`.

### 3.3 Ver Carrito
Devuelve items, subtotales y total.

- **URL:** `GET /api/v1/cart`
- **Auth:** Requiere token de cliente.
- **Body:** No aplica.

### 3.4 Agregar Item al Carrito
Agrega un producto al carrito. Si ya existe, suma la cantidad.

- **URL:** `POST /api/v1/cart/items`
- **Auth:** Requiere token de cliente.
- **Body (JSON):**
```json
{
  "product_id": "44444444-4444-4444-4444-444444444444",
  "quantity": 2
}
```
- **Reglas:**
  - Producto debe existir, estar activo y tener stock suficiente.
  - La base de datos valida stock tambien con trigger.

### 3.5 Actualizar Cantidad de Item
Establece la cantidad exacta del item.

- **URL:** `PATCH /api/v1/cart/items/:id`
- **Auth:** Requiere token de cliente.
- **Body (JSON):**
```json
{
  "quantity": 3
}
```

### 3.6 Eliminar Item del Carrito
Elimina un item del carrito.

- **URL:** `DELETE /api/v1/cart/items/:id`
- **Auth:** Requiere token de cliente.
- **Body:** No aplica.

## Fase 4: Checkout, pedidos y operacion

Esta fase conecta los dos mundos: el cliente crea pedidos desde la tienda online, y el panel interno los consulta y gestiona.

### 4.1 Crear Pedido
Crea un pedido desde el carrito del cliente o desde items enviados directamente.

- **URL:** `POST /api/v1/orders`
- **Auth:** Requiere token.
- **Roles:** cualquier usuario autenticado de la tienda.
- **Caso cliente:** si el token es `customer`, el backend fuerza `customer_id` desde el token y puede usar el carrito.
- **Caso staff/admin/owner:** puede enviar `customer_id` e items directos.
- **Body desde carrito (cliente):**
```json
{
  "notes": "Entregar en porteria"
}
```
- **Body con items explicitos:**
```json
{
  "customer_id": "55555555-5555-5555-5555-555555555555",
  "notes": "Venta en mostrador",
  "items": [
    {
      "product_id": "44444444-4444-4444-4444-444444444444",
      "quantity": 2,
      "discount": 0
    }
  ]
}
```
- **Reglas de base de datos:**
  - Valida producto activo y stock suficiente.
  - Crea orden e items.
  - Descuenta stock atomicamente.
  - Registra movimientos de inventario.
  - Vacia carrito si aplica.
- **Pertenece a:** tienda online cuando lo usa `customer`; operacion interna cuando lo usa `staff`, `admin` u `owner`.

### 4.2 Listar Pedidos
Lista pedidos paginados con filtros.

- **URL:** `GET /api/v1/orders`
- **Auth:** Requiere token.
- **Roles:** `admin`, `owner`.
- **Query params:**
  - `status`: `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`.
  - `customer_id`: UUID opcional.
  - `desde`: fecha ISO datetime.
  - `hasta`: fecha ISO datetime.
  - `page`: default `1`.
  - `limit`: default `20`, maximo `100`.
- **Ejemplo:** `GET /api/v1/orders?status=pending&page=1&limit=20`
- **Body:** No aplica.
- **Pertenece a:** inventario/operacion interna.

### 4.3 Obtener Pedido
Obtiene pedido con sus items.

- **URL:** `GET /api/v1/orders/:id`
- **Auth:** Requiere token.
- **Roles:** cualquier usuario autenticado.
- **Regla para customer:** solo puede ver sus propios pedidos.
- **Body:** No aplica.
- **Pertenece a:** tienda online para detalle del cliente e inventario/operacion para detalle administrativo.

### 4.4 Actualizar Estado de Pedido
Cambia el estado del pedido.

- **URL:** `PATCH /api/v1/orders/:id/estado`
- **Auth:** Requiere token.
- **Roles:** `admin`, `owner`.
- **Body (JSON):**
```json
{
  "status": "confirmed",
  "notes": "Pago confirmado"
}
```
- **Estados validos:** `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`.
- **Pertenece a:** inventario/operacion interna.
- **Transiciones permitidas por trigger:**
  - `pending` -> `confirmed` o `cancelled`
  - `confirmed` -> `shipped` o `cancelled`
  - `shipped` -> `delivered`
  - `delivered` y `cancelled` son terminales.

## Fase 5: Pagos con Mercado Pago

### 5.1 Pagar con Tarjeta
Procesa pago con tarjeta usando token generado por Mercado Pago JS en frontend.

- **URL:** `POST /api/v1/payments/card`
- **Auth:** Requiere token.
- **Roles:** cualquier usuario autenticado de la tienda.
- **Body (JSON):**
```json
{
  "order_id": "66666666-6666-6666-6666-666666666666",
  "token": "token_generado_por_mp_js",
  "description": "Pago pedido ORD-2026-0001",
  "installments": 1,
  "payment_method_id": "visa",
  "issuer_id": 123,
  "payer": {
    "email": "maria@email.com",
    "identification": {
      "type": "CC",
      "number": "1234567890"
    }
  }
}
```
- **Notas frontend:**
  - El frontend debe integrar Mercado Pago JS para tokenizar la tarjeta.
  - Si el usuario es customer, solo puede pagar sus propios pedidos.

### 5.2 Pagar con PSE
Procesa pago PSE y puede devolver `external_resource_url` para redireccion.

- **URL:** `POST /api/v1/payments/pse`
- **Auth:** Requiere token.
- **Roles:** cualquier usuario autenticado de la tienda.
- **Body (JSON):**
```json
{
  "order_id": "66666666-6666-6666-6666-666666666666",
  "description": "Pago PSE pedido ORD-2026-0001",
  "financial_institution": "1007",
  "callback_url": "https://frontend.com/pagos/retorno",
  "notification_url": "https://api.midominio.com/api/v1/payments/webhook",
  "payer": {
    "email": "maria@email.com",
    "first_name": "Maria",
    "last_name": "Cliente",
    "entity_type": "individual",
    "identification": {
      "type": "CC",
      "number": "1234567890"
    },
    "address": {
      "zip_code": "110111",
      "street_name": "Calle 123",
      "street_number": "45",
      "neighborhood": "Centro",
      "city": "Bogota",
      "federal_unit": "Bogota"
    },
    "phone": {
      "area_code": "57",
      "number": "3001234567"
    }
  }
}
```
- **Frontend:** si la respuesta trae `external_resource_url`, redireccionar al usuario a esa URL.

### 5.3 Webhook Mercado Pago
Recibe notificaciones de Mercado Pago. No debe usarse desde el frontend normal.

- **URL:** `POST /api/v1/payments/webhook`
- **Auth:** No requiere token.
- **Body esperado por Mercado Pago:**
```json
{
  "type": "payment",
  "action": "payment.updated",
  "data": {
    "id": "123456789"
  }
}
```
- **Funcionamiento:**
  - Si `type` es `payment`, consulta el pago real en Mercado Pago.
  - Actualiza el estado del pago en base de datos.
  - Siempre responde HTTP 200 para evitar reintentos innecesarios.

## Fase 6: Panel Superadmin

### 6.1 Bootstrap Primer Superadmin
Crea el primer superadmin. Solo funciona si no existe ninguno.

- **URL:** `POST /api/v1/admin/auth/bootstrap`
- **Auth:** No requiere token.
- **Body (JSON):**
```json
{
  "email": "superadmin@app.com",
  "password": "PasswordMuySegura123",
  "name": "Super Admin"
}
```
- **Validaciones:** password minimo 10 caracteres.
- **Frontend:** esta pantalla deberia ocultarse o protegerse cuando ya exista superadmin.

### 6.2 Login Superadmin
Inicia sesion global sin tenant.

- **URL:** `POST /api/v1/admin/auth/login`
- **Auth:** No requiere token.
- **Body (JSON):**
```json
{
  "email": "superadmin@app.com",
  "password": "PasswordMuySegura123"
}
```
- **Respuesta:** devuelve token y datos del admin.

### 6.3 Registrar Superadmin Adicional
Crea otro superadmin.

- **URL:** `POST /api/v1/admin/auth/register`
- **Auth:** Requiere token superadmin.
- **Body (JSON):**
```json
{
  "email": "admin2@app.com",
  "password": "PasswordMuySegura123",
  "name": "Admin Dos"
}
```

### 6.4 Listar Tiendas
Lista todas las tiendas del sistema.

- **URL:** `GET /api/v1/admin/shops`
- **Auth:** Requiere token superadmin.
- **Query params:** `page`, `limit`.
- **Ejemplo:** `GET /api/v1/admin/shops?page=1&limit=20`
- **Body:** No aplica.

### 6.5 Obtener Tienda
Obtiene una tienda por UUID.

- **URL:** `GET /api/v1/admin/shops/:id`
- **Auth:** Requiere token superadmin.
- **Body:** No aplica.

### 6.6 Crear Tienda desde Superadmin
Crea una tienda y su owner desde el panel global.

- **URL:** `POST /api/v1/admin/shops`
- **Auth:** Requiere token superadmin.
- **Body (JSON):**
```json
{
  "name": "Tienda Norte",
  "slug": "tienda-norte",
  "email": "contacto@tiendanorte.com",
  "phone": "3001234567",
  "address": "Calle 50 # 10-20",
  "logo_url": "https://cdn.com/logo.png",
  "currency": "COP",
  "timezone": "America/Bogota",
  "plan": "basic",
  "owner_name": "Owner Norte",
  "owner_email": "owner@tiendanorte.com",
  "owner_password": "PasswordSegura123"
}
```
- **Planes validos:** `free`, `basic`, `pro`, `enterprise`.

### 6.7 Actualizar Tienda
Actualiza datos administrativos de una tienda.

- **URL:** `PATCH /api/v1/admin/shops/:id`
- **Auth:** Requiere token superadmin.
- **Body (JSON):**
```json
{
  "name": "Tienda Norte Plus",
  "email": "contacto@tiendanorte.com",
  "phone": "3007654321",
  "address": "Nueva direccion",
  "logo_url": "https://cdn.com/logo-nuevo.png",
  "currency": "COP",
  "timezone": "America/Bogota",
  "is_active": true,
  "plan": "pro"
}
```

### 6.8 Eliminar Tienda
Desactiva una tienda con soft delete.

- **URL:** `DELETE /api/v1/admin/shops/:id`
- **Auth:** Requiere token superadmin.
- **Body:** No aplica.
- **Efecto:** marca `is_active = false`. `tenantGuard` bloqueara futuras requests de esa tienda.

## Disparadores, procedimientos y automatismos

### D1. Trigger global `updated_at`
Actualiza automaticamente `updated_at` antes de cada `UPDATE`.

- **Funcion:** `update_updated_at()`
- **Tablas con trigger:**
  - `shops_updated_at`
  - `users_updated_at`
  - `categories_updated_at`
  - `suppliers_updated_at`
  - `products_updated_at`
  - `customers_updated_at`
  - `orders_updated_at`
  - `cart_items_updated_at`
  - `payments_updated_at`
  - `super_admins_updated_at`
- **Impacto frontend:** no se debe enviar `updated_at`; la base lo maneja.

### D2. Trigger de stock bajo
Al actualizar stock, avisa cuando el producto cae a `stock_min` o menos.

- **Trigger:** `trg_alerta_stock_bajo`
- **Tabla:** `products`
- **Funcion:** `fn_trigger_alerta_stock_bajo()`
- **Cuando corre:** `AFTER UPDATE OF stock`.
- **Que hace:** registra un `RAISE WARNING` en PostgreSQL.
- **Rutas que pueden activarlo:**
  - `PATCH /api/v1/products/:id/stock`
  - `POST /api/v1/orders`
- **Impacto frontend:** conviene mostrar alerta visual usando el filtro `GET /api/v1/products?low_stock=true`.

### D3. Trigger de validacion de stock en carrito
Bloquea cantidades mayores al stock disponible aunque alguien intente escribir directo en DB.

- **Trigger:** `trg_validar_stock_carrito`
- **Tabla:** `cart_items`
- **Funcion:** `fn_trigger_validar_stock_carrito()`
- **Cuando corre:** `BEFORE INSERT OR UPDATE OF quantity`.
- **Rutas que pueden activarlo:**
  - `POST /api/v1/cart/items`
  - `PATCH /api/v1/cart/items/:id`
- **Errores posibles:** producto no encontrado, producto no disponible, stock insuficiente.
- **Impacto frontend:** mostrar mensaje claro y refrescar carrito/producto.

### D4. Checkout atomico desde base de datos
La creacion del pedido vive en el procedimiento `sp_crear_pedido`.

- **Procedimiento:** `sp_crear_pedido`
- **Ruta:** `POST /api/v1/orders`
- **Que hace en una sola transaccion:**
  - valida productos y stock.
  - crea `orders`.
  - crea `order_items`.
  - descuenta stock.
  - registra `inventory_movements`.
  - vacia el carrito si hay customer.
- **Impacto frontend:** despues de crear pedido, refrescar carrito y productos.

### D5. Trigger de maquina de estados de pedidos
Evita cambios de estado invalidos.

- **Trigger:** `trg_maquina_estados_pedido`
- **Tabla:** `orders`
- **Funcion:** `fn_trigger_maquina_estados_pedido()`
- **Cuando corre:** `BEFORE UPDATE OF status`.
- **Ruta que lo activa:** `PATCH /api/v1/orders/:id/estado`.
- **Transiciones permitidas:**
  - `pending` -> `confirmed`
  - `pending` -> `cancelled`
  - `confirmed` -> `shipped`
  - `confirmed` -> `cancelled`
  - `shipped` -> `delivered`
- **Estados terminales:** `delivered`, `cancelled`.

### D6. Trigger de pago aprobado confirma pedido
Cuando Mercado Pago confirma un pago, el pedido pasa automaticamente de `pending` a `confirmed`.

- **Trigger:** `trg_pago_aprobado_confirma_pedido`
- **Tabla:** `payments`
- **Funcion:** `fn_trigger_pago_aprobado_confirma_pedido()`
- **Cuando corre:** `AFTER UPDATE OF status`.
- **Ruta que normalmente lo activa:** `POST /api/v1/payments/webhook`.
- **Condicion:** `payments.status` cambia a `approved`.
- **Impacto frontend:** despues del retorno de Mercado Pago, consultar el pedido con `GET /api/v1/orders/:id` para ver el estado real.

## Orden sugerido de desarrollo frontend

### Fase A: Infraestructura frontend
- Configurar cliente HTTP con `baseURL`.
- Manejar `success`, `data`, `meta` y `message`.
- Interceptor para `Authorization: Bearer <token>`.
- Crear layouts separados:
  - Layout inventario/admin de tienda.
  - Layout tienda online/cliente.
  - Layout superadmin.

### Fase B: Autenticacion y sesiones
- Registro de tienda owner.
- Login interno.
- Selector de tienda.
- Registro/login de cliente.
- Login de superadmin.
- Guards por rol: `superadmin`, `owner`, `admin`, `staff`, `customer`.

### Fase C: Inventario y administracion de tienda
- CRUD categorias.
- Listado administrativo de productos con filtros.
- Crear/editar producto con subida de imagen usando `multipart/form-data` y campo `image`.
- Ajuste de stock.
- Vista de bajo stock usando `low_stock=true`.
- Gestion administrativa de pedidos.
- Cambio de estado respetando la maquina de estados.

### Fase D: Tienda online y experiencia cliente
- Catalogo cliente reutilizando `GET /products`.
- Filtros por categorias reutilizando `GET /categories`.
- Registro/login cliente por `shop_slug`.
- Carrito: ver, agregar, actualizar y eliminar.
- Checkout desde carrito.
- Detalle de pedido del cliente.

### Fase E: Pagos de tienda online
- Integracion Mercado Pago JS para generar token de tarjeta.
- Formulario de tarjeta.
- Formulario PSE y redireccion a `external_resource_url`.
- Pantalla de retorno de pago que consulte el estado real del pedido.
- Mensajes para `approved`, `pending`, `in_process`, `rejected` y `cancelled`.

### Fase F: Superadmin
- Bootstrap inicial.
- Login superadmin.
- Gestion de tiendas.
- Activar/desactivar tiendas.
- Gestion de planes.
- Registro de superadmins adicionales.

## Matriz rapida de permisos

| Modulo | Ruta base | Roles principales |
| --- | --- | --- |
| Auth tienda | `/api/v1/auth/*` | Publico / token temporal |
| Categorias lectura | `/api/v1/categories` | Cualquier autenticado |
| Categorias escritura | `/api/v1/categories` | `admin`, `owner`; delete solo `owner` |
| Productos lectura | `/api/v1/products` | Cualquier autenticado |
| Productos escritura | `/api/v1/products` | `admin`, `owner`; delete solo `owner`; stock `staff+` |
| Carrito | `/api/v1/cart` | `customer` |
| Pedidos crear/detalle | `/api/v1/orders` | Cualquier autenticado, con restriccion para customer |
| Pedidos listar/estado | `/api/v1/orders` | `admin`, `owner` |
| Pagos | `/api/v1/payments` | Cualquier autenticado |
| Webhook pagos | `/api/v1/payments/webhook` | Publico para Mercado Pago |
| Superadmin | `/api/v1/admin` | `superadmin` |

## Endpoints faltantes o pendientes para frontend

Esta seccion documenta las necesidades que el frontend va a requerir, pero que actualmente no estan completas como rutas Express. Algunas se pueden resolver de forma parcial con endpoints existentes, pero lo ideal es crear endpoints dedicados.

### F1. Resumen general del dashboard
Pantalla principal del panel interno de la tienda.

- **Endpoint sugerido:** `GET /api/v1/dashboard/summary`
- **Auth:** Requiere token.
- **Roles sugeridos:** `admin`, `owner`.
- **Estado actual:** Falta crear.
- **Para que sirve:** alimentar tarjetas principales del dashboard.
- **Respuesta sugerida:**
```json
{
  "success": true,
  "data": {
    "total_orders": 120,
    "total_sales": 5800000,
    "total_products": 85,
    "stock_alerts": 7,
    "monthly_income": 1250000,
    "monthly_orders": 32,
    "new_customers": 14,
    "weekly_sales": 420000
  }
}
```
- **Notas backend:** se puede calcular desde `orders`, `order_items`, `products` y `customers`.

### F2. Alertas de inventario dedicadas
Lista productos en alerta para el panel de inventario.

- **Endpoint sugerido:** `GET /api/v1/inventory/alerts`
- **Auth:** Requiere token.
- **Roles sugeridos:** `staff`, `admin`, `owner`.
- **Estado actual:** Parcial.
- **Alternativa actual:** `GET /api/v1/products?low_stock=true`
- **Para que sirve:** mostrar productos con stock bajo o sin stock.
- **Respuesta sugerida:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "sku": "ARROZ-001",
      "name": "Arroz Diana 500g",
      "stock": 2,
      "stock_min": 5,
      "stock_max": 100,
      "unit": "unidad",
      "category_name": "Granos",
      "alerta": "stock_bajo"
    }
  ]
}
```
- **Notas backend:** la base ya tiene la vista `v_stock_bajo`, pero no existe una ruta que la exponga directamente.

### F3. Estado calculado de productos en lista
Campo directo para saber si cada producto esta `ok`, en `stock_bajo` o `sin_stock`.

- **Endpoint a mejorar:** `GET /api/v1/products`
- **Auth:** Requiere token.
- **Roles:** cualquier usuario autenticado de la tienda.
- **Estado actual:** Parcial.
- **Actualmente:** el endpoint devuelve `stock`, `stock_min` y `stock_max`; el frontend puede calcular el estado.
- **Mejora sugerida en respuesta:**
```json
{
  "id": "uuid",
  "sku": "ARROZ-001",
  "name": "Arroz Diana 500g",
  "stock": 2,
  "stock_min": 5,
  "estado_stock": "stock_bajo"
}
```
- **Notas backend:** la vista SQL `v_productos` ya calcula `estado_stock`, pero la funcion actual `fn_listar_productos` no lo retorna.

### F4. Ingresos del mes
Metrica para tarjeta o grafica del dashboard.

- **Endpoint sugerido:** `GET /api/v1/dashboard/monthly-income`
- **Auth:** Requiere token.
- **Roles sugeridos:** `admin`, `owner`.
- **Estado actual:** Falta crear.
- **Para que sirve:** sumar ventas del mes actual.
- **Respuesta sugerida:**
```json
{
  "success": true,
  "data": {
    "month": "2026-05",
    "income": 1250000,
    "orders_count": 32
  }
}
```
- **Notas backend:** debe definir si cuenta todos los pedidos o solo estados como `confirmed`, `shipped` y `delivered`.

### F5. Pedidos del mes
Conteo de pedidos creados en el mes actual.

- **Endpoint sugerido:** `GET /api/v1/dashboard/monthly-orders`
- **Auth:** Requiere token.
- **Roles sugeridos:** `admin`, `owner`.
- **Estado actual:** Parcial.
- **Alternativa actual:** `GET /api/v1/orders?desde=2026-05-01T00:00:00.000Z&hasta=2026-05-31T23:59:59.999Z` y leer `meta.total`.
- **Respuesta sugerida:**
```json
{
  "success": true,
  "data": {
    "month": "2026-05",
    "orders_count": 32
  }
}
```

### F6. Ventas de la semana
Datos para grafica semanal.

- **Endpoint sugerido:** `GET /api/v1/dashboard/weekly-sales`
- **Auth:** Requiere token.
- **Roles sugeridos:** `admin`, `owner`.
- **Estado actual:** Falta crear.
- **Para que sirve:** mostrar ventas agrupadas por dia.
- **Respuesta sugerida:**
```json
{
  "success": true,
  "data": [
    { "day": "lunes", "date": "2026-05-04", "sales": 150000, "orders": 4 },
    { "day": "martes", "date": "2026-05-05", "sales": 230000, "orders": 6 }
  ]
}
```
- **Notas backend:** debe usar rango semanal y agrupar por fecha de `orders.created_at`.

### F7. Estado de pedidos para dashboard
Conteo de pedidos por estado.

- **Endpoint sugerido:** `GET /api/v1/dashboard/order-status`
- **Auth:** Requiere token.
- **Roles sugeridos:** `admin`, `owner`.
- **Estado actual:** Parcial.
- **Alternativa actual:** llamar varias veces `GET /api/v1/orders?status=pending`, `confirmed`, etc. y leer `meta.total`.
- **Respuesta sugerida:**
```json
{
  "success": true,
  "data": {
    "pending": 10,
    "confirmed": 8,
    "shipped": 4,
    "delivered": 95,
    "cancelled": 3
  }
}
```

### F8. Productos mas vendidos
Ranking de productos por unidades vendidas o por valor vendido.

- **Endpoint sugerido:** `GET /api/v1/dashboard/top-products`
- **Auth:** Requiere token.
- **Roles sugeridos:** `admin`, `owner`.
- **Estado actual:** Falta crear.
- **Query params sugeridos:**
  - `desde`: fecha ISO opcional.
  - `hasta`: fecha ISO opcional.
  - `limit`: cantidad de productos, default `10`.
  - `sort`: `quantity` o `revenue`.
- **Respuesta sugerida:**
```json
{
  "success": true,
  "data": [
    {
      "product_id": "uuid",
      "sku": "ARROZ-001",
      "name": "Arroz Diana 500g",
      "quantity_sold": 120,
      "revenue": 540000
    }
  ]
}
```
- **Notas backend:** se calcula desde `order_items` unido con `orders` y `products`.

### F9. Clientes de la tienda
Listado administrativo de clientes registrados.

- **Endpoint sugerido:** `GET /api/v1/customers`
- **Auth:** Requiere token.
- **Roles sugeridos:** `staff`, `admin`, `owner`.
- **Estado actual:** Falta crear modulo/rutas de clientes.
- **Query params sugeridos:**
  - `search`: nombre o email.
  - `is_active`: `true` o `false`.
  - `page`: default `1`.
  - `limit`: default `20`.
- **Respuesta sugerida:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Maria Cliente",
      "email": "maria@email.com",
      "phone": "3001234567",
      "address": "Calle 123",
      "is_active": true,
      "created_at": "2026-05-09T20:00:00.000Z"
    }
  ],
  "meta": {
    "total": 14,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```
- **Notas backend:** la tabla `customers` existe y auth permite registro/login, pero no hay rutas administrativas para listarlos.

### F10. Detalle de cliente
Detalle administrativo de un cliente.

- **Endpoint sugerido:** `GET /api/v1/customers/:id`
- **Auth:** Requiere token.
- **Roles sugeridos:** `staff`, `admin`, `owner`.
- **Estado actual:** Falta crear.
- **Para que sirve:** ver datos del cliente y opcionalmente resumen de pedidos.
- **Respuesta sugerida:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Maria Cliente",
    "email": "maria@email.com",
    "phone": "3001234567",
    "address": "Calle 123",
    "is_active": true,
    "total_orders": 5,
    "total_spent": 320000
  }
}
```

### F11. CRUD administrativo de clientes
Permite crear, editar o desactivar clientes desde el panel interno.

- **Endpoints sugeridos:**
  - `POST /api/v1/customers`
  - `PATCH /api/v1/customers/:id`
  - `DELETE /api/v1/customers/:id`
- **Auth:** Requiere token.
- **Roles sugeridos:** `admin`, `owner`.
- **Estado actual:** Falta crear.
- **Body sugerido para crear:**
```json
{
  "name": "Cliente Mostrador",
  "email": "cliente@email.com",
  "phone": "3001234567",
  "address": "Calle 123",
  "notes": "Cliente frecuente"
}
```
- **Notas:** esto es diferente al registro/login del cliente en `/auth/customer/register`.

### F12. Movimientos de inventario
Historial de entradas, salidas, ventas, ajustes y perdidas.

- **Endpoint sugerido:** `GET /api/v1/inventory/movements`
- **Auth:** Requiere token.
- **Roles sugeridos:** `staff`, `admin`, `owner`.
- **Estado actual:** Falta crear.
- **Query params sugeridos:**
  - `product_id`: UUID opcional.
  - `type`: `purchase`, `sale`, `adjustment`, `return`, `loss`.
  - `desde`: fecha ISO opcional.
  - `hasta`: fecha ISO opcional.
  - `page`: default `1`.
  - `limit`: default `20`.
- **Respuesta sugerida:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "product_id": "uuid",
      "type": "sale",
      "quantity": -2,
      "stock_before": 30,
      "stock_after": 28,
      "notes": null,
      "created_at": "2026-05-09T20:00:00.000Z"
    }
  ]
}
```
- **Notas backend:** la tabla `inventory_movements` existe y se llena desde ajuste de stock y checkout, pero no hay endpoint para consultarla.
