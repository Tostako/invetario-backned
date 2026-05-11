# Documentacion de endpoints para tienda de ropa

Documento enfocado en el frontend de la tienda online de ropa. No cubre el panel interno de inventario, superadmin ni dashboard administrativo, salvo cuando un endpoint existente tambien sirve para mostrar catalogo al cliente.

- **Base URL API:** `/api/v1`
- **Auth:** las rutas protegidas usan `Authorization: Bearer <token>`.
- **Rol principal para tienda online:** `customer`.
- **Tenant:** la tienda se identifica por `shop_slug` durante registro/login del cliente. Luego el `shop_id` viaja dentro del JWT.
- **Formato respuesta exitosa:**
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
- **Formato error:**
```json
{
  "success": false,
  "message": "Mensaje del error"
}
```

## Flujo principal de compra

1. Cliente entra a la tienda por `shop_slug`.
2. Cliente se registra o inicia sesion.
3. Frontend guarda el token `customer`.
4. Frontend lista categorias y productos activos.
5. Cliente agrega productos al carrito.
6. Cliente crea pedido desde carrito.
7. Cliente paga con tarjeta o PSE.
8. Frontend consulta el pedido para ver estado actualizado.

## Importante para tienda de ropa

El backend actual maneja productos genericos. Para ropa, campos como talla, color, genero, coleccion o variante deben representarse temporalmente con:

- `category_id`: categorias como camisetas, pantalones, vestidos, zapatos.
- `name`: nombre comercial.
- `description`: detalles de tela, talla, color, fit, temporada.
- `sku`: SKU con variante incluida, por ejemplo `CAMISETA-NEGRA-M`.
- `unit`: normalmente `unidad`.
- `image_url`: imagen principal del producto.

Actualmente no existen entidades dedicadas para variantes como `sizes`, `colors` o `product_variants`.

## Fase 1: Autenticacion de cliente

### 1.1 Registro de cliente en tienda de ropa
Registra un cliente dentro de una tienda especifica usando `shop_slug`.

- **URL:** `POST /api/v1/auth/customer/register`
- **Auth:** No requiere token.
- **Body (JSON):**
```json
{
  "name": "Laura Gomez",
  "email": "laura@email.com",
  "password": "123456",
  "phone": "3001234567",
  "address": "Calle 10 # 20-30",
  "shop_slug": "ropa-urbana"
}
```
- **Validaciones:**
  - `name`: minimo 2 caracteres.
  - `email`: formato email.
  - `password`: minimo 6 y maximo 72 caracteres.
  - `shop_slug`: slug de la tienda.
- **Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-customer",
    "shopId": "uuid",
    "customerId": "uuid"
  }
}
```
- **Uso frontend:** guardar `token` para catalogo, carrito, pedidos y pagos.

### 1.2 Login de cliente
Inicia sesion de un cliente dentro de una tienda.

- **URL:** `POST /api/v1/auth/customer/login`
- **Auth:** No requiere token.
- **Body (JSON):**
```json
{
  "email": "laura@email.com",
  "password": "123456",
  "shop_slug": "ropa-urbana"
}
```
- **Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-customer",
    "customer": {
      "id": "uuid",
      "name": "Laura Gomez",
      "email": "laura@email.com"
    }
  }
}
```

## Fase 2: Catalogo de ropa

Estas rutas requieren token porque el backend actual protege productos y categorias con JWT. El token de cliente funciona para lectura.

### 2.1 Listar categorias
Lista categorias activas de la tienda: camisetas, pantalones, vestidos, zapatos, accesorios, etc.

- **URL:** `GET /api/v1/categories`
- **Auth:** Requiere token `customer`.
- **Query params:**
  - `is_active`: usar `true` para tienda online.
  - `page`: default `1`.
  - `limit`: default `20`, maximo `100`.
- **Ejemplo:** `GET /api/v1/categories?is_active=true&page=1&limit=50`
- **Body:** No aplica.
- **Uso frontend:** menu, filtros laterales, tabs de categorias.

### 2.2 Obtener categoria
Obtiene detalle de una categoria.

- **URL:** `GET /api/v1/categories/:id`
- **Auth:** Requiere token `customer`.
- **Body:** No aplica.

### 2.3 Listar productos de ropa
Lista productos activos de la tienda.

- **URL:** `GET /api/v1/products`
- **Auth:** Requiere token `customer`.
- **Query params:**
  - `search`: busca por nombre o SKU.
  - `category_id`: filtra por categoria.
  - `is_active`: usar `true`.
  - `page`: default `1`.
  - `limit`: default `20`, maximo `100`.
- **Ejemplo:** `GET /api/v1/products?is_active=true&search=camiseta&page=1&limit=20`
- **Body:** No aplica.
- **Respuesta esperada:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "shop_id": "uuid",
      "category_id": "uuid",
      "sku": "CAMISETA-NEGRA-M",
      "name": "Camiseta negra talla M",
      "description": "Camiseta oversize 100% algodon. Color negro. Talla M.",
      "image_url": "https://cdn.com/camiseta-negra.jpg",
      "price": 79900,
      "stock": 12,
      "stock_min": 2,
      "stock_max": 50,
      "unit": "unidad",
      "is_active": true,
      "category_name": "Camisetas"
    }
  ],
  "meta": {
    "total": 40,
    "page": 1,
    "limit": 20,
    "totalPages": 2
  }
}
```
- **Uso frontend:** grilla de productos, busqueda, filtros y paginacion.
- **Nota ropa:** si una prenda tiene varias tallas o colores, cada combinacion debe existir como producto/SKU independiente en el backend actual.

### 2.4 Obtener detalle de producto
Muestra detalle de una prenda.

- **URL:** `GET /api/v1/products/:id`
- **Auth:** Requiere token `customer`.
- **Body:** No aplica.
- **Uso frontend:** pagina de producto.
- **Respuesta esperada:** un objeto producto con precio, stock, categoria, descripcion e imagen.

## Fase 3: Carrito de compras

Estas rutas solo funcionan con rol `customer`. Si se intenta usar token de `owner`, `admin` o `staff`, el backend responde error porque no tienen `customer_id`.

### 3.1 Ver carrito
Obtiene items actuales del carrito, subtotales y total.

- **URL:** `GET /api/v1/cart`
- **Auth:** Requiere token `customer`.
- **Body:** No aplica.
- **Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "product_id": "uuid",
        "quantity": 2,
        "product_name": "Camiseta negra talla M",
        "product_sku": "CAMISETA-NEGRA-M",
        "unit_price": 79900,
        "subtotal": 159800,
        "stock_available": 12
      }
    ],
    "total": 159800
  }
}
```

### 3.2 Agregar prenda al carrito
Agrega una prenda al carrito. Si ya existe, suma la cantidad.

- **URL:** `POST /api/v1/cart/items`
- **Auth:** Requiere token `customer`.
- **Body (JSON):**
```json
{
  "product_id": "44444444-4444-4444-4444-444444444444",
  "quantity": 1
}
```
- **Reglas:**
  - Producto debe existir en la tienda del token.
  - Producto debe estar activo.
  - Debe existir stock suficiente.
- **Uso frontend:** boton "Agregar al carrito".

### 3.3 Actualizar cantidad de item
Cambia la cantidad exacta de una prenda en el carrito.

- **URL:** `PATCH /api/v1/cart/items/:id`
- **Auth:** Requiere token `customer`.
- **Body (JSON):**
```json
{
  "quantity": 3
}
```
- **Uso frontend:** selector de cantidad en carrito.

### 3.4 Eliminar item del carrito
Elimina una prenda del carrito.

- **URL:** `DELETE /api/v1/cart/items/:id`
- **Auth:** Requiere token `customer`.
- **Body:** No aplica.
- **Uso frontend:** boton eliminar item.

## Fase 4: Checkout y pedidos

### 4.1 Crear pedido desde carrito
Crea el pedido usando los items actuales del carrito del cliente.

- **URL:** `POST /api/v1/orders`
- **Auth:** Requiere token `customer`.
- **Body (JSON):**
```json
{
  "notes": "Enviar en horario de la tarde"
}
```
- **Que hace el backend:**
  - Lee el carrito del cliente.
  - Valida stock.
  - Crea pedido e items.
  - Descuenta stock.
  - Vacia el carrito.
- **Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "order_number": "ORD-2026-0001",
    "status": "pending",
    "total": 159800
  }
}
```
- **Uso frontend:** boton "Finalizar compra".

### 4.2 Crear pedido con items directos
Alternativa para crear pedido sin pasar por carrito.

- **URL:** `POST /api/v1/orders`
- **Auth:** Requiere token `customer`.
- **Body (JSON):**
```json
{
  "notes": "Compra directa",
  "items": [
    {
      "product_id": "44444444-4444-4444-4444-444444444444",
      "quantity": 1,
      "discount": 0
    }
  ]
}
```
- **Uso frontend:** compra rapida tipo "Comprar ahora".

### 4.3 Ver detalle de pedido
Consulta un pedido del cliente.

- **URL:** `GET /api/v1/orders/:id`
- **Auth:** Requiere token `customer`.
- **Body:** No aplica.
- **Regla:** el cliente solo puede ver pedidos propios.
- **Uso frontend:** pantalla de confirmacion y seguimiento de pedido.

### 4.4 Estados de pedido
Estados posibles:

- `pending`: pedido creado, pendiente de pago o confirmacion.
- `confirmed`: pago confirmado o pedido aceptado.
- `shipped`: enviado.
- `delivered`: entregado.
- `cancelled`: cancelado.

El cliente puede consultar el estado con `GET /api/v1/orders/:id`, pero no puede cambiarlo. El cambio de estado es administrativo.

## Fase 5: Pagos

### 5.1 Pago con tarjeta
Procesa pago con tarjeta usando token generado por Mercado Pago JS en el frontend.

- **URL:** `POST /api/v1/payments/card`
- **Auth:** Requiere token `customer`.
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
    "email": "laura@email.com",
    "identification": {
      "type": "CC",
      "number": "1234567890"
    }
  }
}
```
- **Uso frontend:**
  - Integrar Mercado Pago JS.
  - Tokenizar tarjeta en frontend.
  - Enviar token al backend.
- **Regla:** si el token es de cliente, solo puede pagar sus propios pedidos.

### 5.2 Pago con PSE
Procesa pago PSE y devuelve URL externa para redireccion si Mercado Pago la entrega.

- **URL:** `POST /api/v1/payments/pse`
- **Auth:** Requiere token `customer`.
- **Body (JSON):**
```json
{
  "order_id": "66666666-6666-6666-6666-666666666666",
  "description": "Pago PSE pedido ORD-2026-0001",
  "financial_institution": "1007",
  "callback_url": "https://tienda-ropa.com/pagos/retorno",
  "notification_url": "https://api.midominio.com/api/v1/payments/webhook",
  "payer": {
    "email": "laura@email.com",
    "first_name": "Laura",
    "last_name": "Gomez",
    "entity_type": "individual",
    "identification": {
      "type": "CC",
      "number": "1234567890"
    },
    "address": {
      "zip_code": "110111",
      "street_name": "Calle 10",
      "street_number": "20-30",
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
- **Uso frontend:** si la respuesta trae `external_resource_url`, redireccionar al cliente.

### 5.3 Webhook Mercado Pago
Endpoint para Mercado Pago, no para uso directo del frontend.

- **URL:** `POST /api/v1/payments/webhook`
- **Auth:** No requiere token.
- **Body esperado:**
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
  - Recibe ID del pago.
  - Consulta estado real en Mercado Pago.
  - Actualiza pago en base de datos.
  - Si el pago queda `approved`, el trigger confirma el pedido.

## Fase 6: Pantallas recomendadas para la tienda de ropa

### 6.1 Login y registro
- Usa `POST /auth/customer/register`.
- Usa `POST /auth/customer/login`.

### 6.2 Home/catalogo
- Usa `GET /categories?is_active=true`.
- Usa `GET /products?is_active=true`.

### 6.3 Filtro por categoria
- Usa `GET /products?category_id=<uuid>&is_active=true`.

### 6.4 Busqueda
- Usa `GET /products?search=<texto>&is_active=true`.

### 6.5 Detalle de prenda
- Usa `GET /products/:id`.

### 6.6 Carrito
- Usa `GET /cart`.
- Usa `POST /cart/items`.
- Usa `PATCH /cart/items/:id`.
- Usa `DELETE /cart/items/:id`.

### 6.7 Checkout
- Usa `POST /orders`.
- Luego usa `POST /payments/card` o `POST /payments/pse`.

### 6.8 Confirmacion y seguimiento
- Usa `GET /orders/:id`.

## Endpoints disponibles pero no ideales para tienda publica

### Perfil de tienda
- **Ruta existente:** `GET /api/v1/shop`
- **Problema:** requiere `authenticate`, `tenantGuard` y `requireShopStaff`, por lo tanto esta orientada a staff/admin, no a cliente publico.
- **Recomendacion:** crear un endpoint publico para leer datos de la tienda por slug.

### Endpoint recomendado faltante
Para una tienda de ropa publica convendria agregar:

- **URL sugerida:** `GET /api/v1/public/shops/:slug`
- **Auth:** No requiere token.
- **Uso:** cargar nombre, logo, descripcion, moneda, telefono, direccion y configuracion publica antes del login.
- **Respuesta sugerida:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Ropa Urbana",
    "slug": "ropa-urbana",
    "description": "Moda urbana para todos los dias",
    "logo_url": "https://cdn.com/logo.png",
    "currency": "COP",
    "phone": "3001234567",
    "address": "Bogota, Colombia"
  }
}
```

## Faltantes especificos para tienda de ropa

El frontend puede funcionar con el backend actual, pero estas mejoras serian importantes para una tienda de ropa mas completa:

### R1. Variantes de producto
- **Endpoint sugerido:** `GET /api/v1/products/:id/variants`
- **Necesidad:** manejar tallas, colores y stock por variante.
- **Ejemplo:** camiseta negra en tallas S, M, L con stocks diferentes.

### R2. Filtros por talla y color
- **Endpoint sugerido:** `GET /api/v1/products?size=M&color=negro`
- **Necesidad:** filtrar prendas por atributos reales, no solo por texto.

### R3. Galeria de imagenes
- **Endpoint sugerido:** `GET /api/v1/products/:id/images`
- **Necesidad:** mostrar varias fotos por prenda.
- **Actual:** solo existe `image_url` principal.

### R4. Direcciones de envio
- **Endpoint sugerido:** `GET /api/v1/customer/addresses`
- **Necesidad:** permitir multiples direcciones por cliente.
- **Actual:** el cliente tiene un solo `address` en registro.

### R5. Cupones o descuentos
- **Endpoint sugerido:** `POST /api/v1/coupons/validate`
- **Necesidad:** aplicar descuentos en checkout.
- **Actual:** el pedido acepta `discount` en items, pero no hay modulo de cupones.

### R6. Favoritos
- **Endpoint sugerido:** `POST /api/v1/favorites`
- **Necesidad:** guardar prendas favoritas del cliente.

### R7. Historial/listado de pedidos del cliente
- **Endpoint sugerido:** `GET /api/v1/customer/orders`
- **Necesidad:** que el cliente vea todos sus pedidos.
- **Actual:** existe `GET /orders/:id`, pero `GET /orders` esta limitado a `admin` y `owner`.

