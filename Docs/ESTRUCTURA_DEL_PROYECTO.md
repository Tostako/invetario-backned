# Estructura y Flujo del Proyecto: Inventario y Tiendas (Backend)

Este documento detalla la estructura principal del proyecto y, de forma especial, **el flujo de vida de los datos**. Explica cómo se procesa la información desde que entra por el cliente (frontend o API), qué validaciones sufre en el servidor de Node.js, y qué responsabilidades asume el motor de base de datos de PostgreSQL en Supabase.

---

## 📂 1. Arquitectura de Archivos (Perspectiva General)

El proyecto sigue una arquitectura limipa y modularizada dividida entre lo que hace el servidor y lo que delega a la base de datos:

- **`src/` (El Servidor Web):** Toda la capa de la API construida en TypeScript/Express. Se divide en dominios (`auth`, `users`, `products`, `orders`, `payments`, etc.).
- **`database/` (El Motor Relacional):** Archivos `.sql` que contienen las definiciones de tablas, políticas de seguridad (RLS), **vistas, funciones, y disparadores (triggers)**. La base de datos no es solo un almacén; contiene reglas de negocio.
- **`node_modules/` & `Archivos Raíz` (`.env`, `package.json`):** Librerías, configuración de entorno y comandos de inicio.
- **`postman/`:** Archivos listos para poder simular e interactuar con el flujo de datos que explicaremos a continuación.

---

## 🔄 2. El Flujo de los Datos: ¿Cómo funciona el proceso?

En esta arquitectura, tanto Node.js (el Backend) como PostgreSQL (la Base de datos) tienen responsabilidades muy específicas. **El Backend actúa como el portero y validador, mientras que la Base de Datos garantiza la integridad atómica de los datos.**

A continuación se muestra qué sucede paso a paso cuando ingresa un dato (Ejemplo: *Creación y pago de un Pedido*):

### FASE 1: Recepción y Validación (Capa Node.js/Express)
Cuando un cliente hace un `POST /api/orders` para comprar:

1. **El Enrutador (Router):** Recibe la solicitud HTTP.
2. **Middlewares (El Portero):** 
   - **Autenticación (JWT):** Valida quién es el usuario (¿es un cliente del sistema? ¿es un empleado?).
   - **Multi-Tenant (`shop_id`):** Obliga a que la petición esté operando siempre dentro de una tienda específica. El backend nunca mezcla datos de dos tiendas diferentes.
   - **Validación de Esquema:** Asegura que los datos entrantes (ej. la lista de productos y cantidades) sean exactamente lo esperado, sin campos basura.
3. **Controladores (Controllers):** Envuelven y leen únicamente los datos importantes y llaman al módulo correspondiente.
4. **Servicios (Services):** La capa lógica. Aquí Node.js prepara la información estructurada que le enviará a la base de datos. En vez de hacer cientos de *inserts* sueltos, ejecuta comandos integrales hacia la BD.

### FASE 2: Integridad y Atomicidad (Capa PostgreSQL/Supabase)
Aquí la información entra a la Base de Datos. El backend utiliza roles especiales (Service Roles) para bypassear las restricciones públicas (RLS), gestionando todo control por sí mismo.

1. **Funciones y Procedimientos Almacenados (Stored Procedures / Functions):**
   - El backend llama a funciones de SQL como `sp_crear_pedido_con_items`.
   - **¿Qué hace?** Esta función procesa internamente una transacción (`plpgsql`): Revisa si hay stock en todos los items, bloquea las filas, resta el inventario, crea la cabecera del pedido (`orders`) y los detalles (`order_items`) **en un solo golpe**. Si algo falla (ej. un producto agotado), desactiva toda la transacción (ROLLBACK) y le avisa al backend. Esto impide que se cree un pedido de 5 items pero que solo se cobren 4.
2. **Disparadores Automáticos (Triggers):**
   - Una vez la función crea los registros, el mero acto de "Insertar" o "Actualizar" dispara eventos automáticos en segundo plano (`Triggers`).
   - Por ejemplo, el `trg_maquina_estados_pedido`: Si Node.js intenta cambiar un pedido de "Entregado" a "Pendiente" nuevamente (lo cual no tiene sentido comercial), el Trigger se despierta a nivel BD y clava un error (`TRANSICION_INVALIDA`), rechazando la operación sin importar qué diga el Backend. Esto garantiza **estricta fiabilidad de estados**.
3. **Motor Histórico y de Movimientos:**
   - La inserción en tablas como `inventory_movements` genera un historial intocable y contable de por qué el stock subió o bajó, siempre ligado al `order_id` o `user_id`.

### FASE 3: Respuesta al Cliente (Vistas y Retorno)
1. **Lecturas Optimadas (Views):** Cuando el backend necesita leer esos registros (para un reporte, un dashboard de administrador o listar el carrito), en lugar de cruzar 8 tablas diferentes, consulta las **Vistas en SQL** (`23_views.sql`). El motor relacional hace la matemática pesada allí (`SUM`, `JOIN`) y solo le entrega los resultados terminados al backend.
2. Node.js recibe la respuesta de la Base de datos (exitosa o con un error nativo codificado) y lo traduce a una respuesta `HTTP 200 (OK)` o `HTTP 400/500 (Error)` devolviéndole en formato JSON el resultado al cliente.

---

## 🏗️ 3. Resumen de Roles y Responsabilidades

### Backend (Node.js / Express)
* Se encarga del I/O (entrar y salir datos del internet).
* Protege las llaves maestras y valida tokens.
* Enruta, verifica formatos (que los números sean números y los textos correos válidos) y rechaza peticiones maliciosas inmediatamente.
* **Toma decisiones de lógica externa:** Llamar pasarelas de pago, enviar notificaciones o conectarse con integraciones de terceros.

### Base de Datos (Supabase / PL/pgSQL)
* **Funciones SQL:** Garantizan que procesos de varios pasos (Afectar caja, restar inventario, crear histórico) sucedan juntos de manera atómica (Transacciones ACID).
* **Triggers y Restricciones:** Guardias de seguridad para la salud de los datos. Supervisan las "Máquinas de Estados", garantizando que, aunque alguien altere el código en el backend y cometa un bug, la base de datos proteja su consistencia.
* **Vistas:** Agregan y aceleran métricas agrupadas para no enlentecer el código local.
* **Seguridad (RLS):** Aisla las peticiones públicas directas, de forma que el internet jamás pueda ver las tablas si no lo hace a través de los tubos validados de nuestro Backend central.
