# Haus Look — Prueba técnica (Backoffice Presupuestos)

Mini backoffice para crear y gestionar presupuestos con líneas de producto, cálculo de totales y exportación a JSON.

---

## Stack y librerías
- *Frontend*: React + TypeScript + Vite
- *UI*: Tailwind CSS + shadcn/ui + Radix UI
- *Estado*: Zustand
- *DB/Backend*: Supabase (PostgreSQL) vía @supabase/supabase-js
- *i18n*: i18next + react-i18next (ES/CA/GL)
- *Notificaciones*: Sileo
- *Utils*: class-variance-authority, clsx, tailwind-merge, lucide-react

---

## Requisitos funcionales (MVP)
- Crear un presupuesto
- Editar un presupuesto existente
- Cambiar estado: draft | sent | accepted
- Listado de presupuestos con filtro por estado
- Gestión de líneas de presupuesto:
  - Selección de producto
  - Cantidad (*> 0*)
  - Precio unitario histórico:
    - autorrelleno desde el producto
    - editable manualmente
  - Total de línea calculado
- Reglas de negocio:
  - line_total = quantity * unit_price
  - subtotal = sum(line_total)
  - vat_amount = subtotal * vat_rate
  - total = subtotal + vat_amount
- Exportación obligatoria:
  - JSON descargable de un presupuesto con cliente, líneas, nombres de producto y totales

---

## Cómo ejecutar

### 1) Instalar dependencias
```bash
npm install

2) Variables de entorno

Crea un archivo .env en la raíz:

VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_xxxxx

3) Ejecutar en local
npm run dev

Modelo de datos (formato obligatorio)

Nota: La BD es PostgreSQL (Supabase). Se usan UUID y timestamps.
El precio histórico se garantiza guardando unit_price en cada QuoteLine.

Entity: Customer

Fields:

id (uuid, PK)

name (text, required)

email (text, optional)

created_at (timestamp, default now())

Indexes:

email (optional / unique si se desea)

Relations:

One-to-many with Quote

Entity: Product

Fields:

id (uuid, PK)

name (text, required)

description (text, optional)

base_price (numeric, required)

created_at (timestamp, default now())

updated_at (timestamp, optional)

Indexes:

name (optional)

Relations:

One-to-many with QuoteLine

Entity: Quote

Fields:

id (uuid, PK)

customer_id (uuid, FK -> Customer.id, required)

status (enum: draft|sent|accepted, required)

vat_rate (numeric, required, e.g. 0.21)

subtotal (numeric, required)

vat_amount (numeric, required)

total (numeric, required)

created_at (timestamp, default now())

updated_at (timestamp, optional)

Indexes:

status (optional)

customer_id (optional)

created_at (optional)

Relations:

Many-to-one with Customer

One-to-many with QuoteLine

Entity: QuoteLine

Fields:

id (uuid, PK)

quote_id (uuid, FK -> Quote.id, required)

product_id (uuid, FK -> Product.id, required)

quantity (int, required, > 0)

unit_price (numeric, required) <-- histórico

line_total (numeric, required)

created_at (timestamp, default now())

Indexes:

quote_id (optional)

product_id (optional)

Relations:

Many-to-one with Quote

Many-to-one with Product

Arquitectura (criterio profesional / hexagonal por módulos)
Estructura principal

src/modules/<context>/domain

Entidades/Tipos (Customer, Product, Quote, QuoteLine, ValueObjects)

src/modules/<context>/application

Casos de uso (list, get by id, create, update, export)

Lógica de negocio: totales, validaciones, merge de líneas

src/modules/<context>/infrastructure

Repositorios (implementación Supabase)

src/modules/<context>/ui

Páginas y componentes del módulo

Store local del módulo (Zustand)

src/shared

Utilidades transversales: supabase client, toast, i18n, ui shared, helpers

Patrón clave

UI → store/usecases → repository → Supabase

La lógica de negocio (totales, validaciones, merge de líneas) vive en application, no pegada al componente.

Decisiones clave (5–10 bullets)

Se usa Supabase (PostgreSQL) como backend real (coincide con el stack del puesto).

unit_price se guarda en QuoteLine para preservar precio histórico aunque cambie Product.base_price.

Los totales se recalculan en frontend al editar y se persisten en Quote al guardar, evitando incoherencias.

Validación mínima: quantity > 0, vat_rate válido y al menos una línea válida antes de guardar.

Se evita duplicar productos: al seleccionar un producto ya existente se fusiona sumando cantidad.

El botón Guardar se deshabilita si no hay cambios (isDirty) o si el formulario está inválido (isValid).

Eliminaciones consistentes: si se elimina una línea se elimina en BD (no quedan registros huérfanos).

Export JSON se implementa como caso de uso + helper de descarga en src/shared/lib/download.
