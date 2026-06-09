# 📘 Reglas del Proyecto

## Plataforma Multitenant para Tiendas

---

## 🎯 Objetivo del Sistema

Desarrollar una plataforma multitenant escalable que permita a múltiples tiendas gestionar productos, usuarios y transacciones dentro de un entorno seguro, aislado y de alto rendimiento.

---

## 🧠 Principios Arquitectónicos

### 1. Multitenancy Obligatorio

* Todas las tablas deben incluir el campo `shop_id`
* Ninguna consulta debe acceder a datos sin filtrar por `shop_id`
* Está prohibido mezclar datos entre tiendas

### 2. Aislamiento de Datos

* Cada request debe estar asociado a un `shop_id`
* Validar siempre que el usuario pertenece a la tienda
* Implementar políticas de seguridad (Row Level Security si aplica)

### 3. Escalabilidad

* Diseñar pensando en múltiples tiendas concurrentes
* Evitar queries pesadas sin índices
* Usar paginación en endpoints

---

## 🧱 Backend (Node.js + Express)

### Estructura

* Arquitectura modular
* Separar:

  * rutas (routes)
  * controladores (controllers)
  * servicios (services)
  * acceso a datos (repositories)

### Reglas

* No colocar lógica de negocio en rutas
* Validar datos en cada endpoint
* Manejar errores con middleware global

### Endpoints

* Seguir estándar REST:

  * GET → obtener datos
  * POST → crear
  * PUT/PATCH → actualizar
  * DELETE → eliminar

---

## 🗄️ Base de Datos (PostgreSQL - Supabase)

### Diseño

* Todas las tablas deben incluir:

  * id (PK)
  * shop_id (FK lógico)
  * created_at
  * updated_at

### Reglas de Integridad

* Usar claves foráneas cuando sea necesario
* Indexar `shop_id` en todas las tablas
* Evitar duplicidad de datos

### Seguridad

* Aplicar Row Level Security (RLS)
* Las políticas deben garantizar:

  * Un usuario solo accede a su tienda

---

## 🔐 Seguridad

* Autenticación obligatoria
* Validación de roles (admin, empleado, etc.)
* Sanitización de inputs
* Protección contra:

  * SQL Injection
  * XSS

---

## 📦 Manejo de Datos

* Todas las respuestas deben ser en JSON
* Estructura estándar:

```
{
  "success": true,
  "data": {},
  "message": ""
}
```

---

## 🚀 Buenas Prácticas

* Código limpio y legible
* Nombres en español para variables y funciones
* Evitar código duplicado (DRY)
* Documentar funciones importantes

---

## ⚠️ Reglas Críticas

* Nunca hacer queries sin `shop_id`
* Nunca confiar en datos del cliente
* Siempre validar inputs
* Siempre manejar errores

##

---

## 📈 Futuro Escalable

* Preparar para microservicios (APIS)

* creacion de documentacion de APIS con explicacion para pruebas 

* creacion de documetacion de funcionamiento del programa 

---

## 🏁 Resumen

Este proyecto debe garantizar:

* Aislamiento total entre tiendas
* Seguridad de datos
* Escalabilidad
* Código mantenible y profesional

---

## 🤖 Reglas de Interacción con IA

* **Análisis y Debugging**: Cuando el usuario pida analizar un error, investigar o revisar una función existente, la IA **no** debe crear un plan de implementación. Debe responder directamente a las preguntas y proporcionar explicaciones breves y concisas.
* **Nuevas Funcionalidades**: Solo se creará un plan de implementación (`implementation_plan.md`) cuando se solicite crear o diseñar una nueva funcionalidad desde cero.

