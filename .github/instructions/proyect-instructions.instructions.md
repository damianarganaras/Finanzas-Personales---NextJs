---
applyTo: '**'
---
# ANÁLISIS COMPLETO DEL PROYECTO FIREFLY III
## REPLICACIÓN USANDO NEXT.JS 15 + TYPESCRIPT + TAILWIND

### 1. ANÁLISIS DE LA ESTRUCTURA DEL PROYECTO

#### 1.1 Arquitectura General
Firefly III es una aplicación web de gestión financiera personal desarrollada en Laravel (PHP). La aplicación sigue una arquitectura MVC con las siguientes características principales:

**Backend (Laravel PHP):**
- Framework: Laravel (versión reciente basada en composer.json)
- Base de datos: MySQL/PostgreSQL/SQLite con migraciones extensivas
- API REST con versionado (V1 y V2)
- Autenticación: Laravel Passport (OAuth2)
- Autorización: Roles y permisos
- Arquitectura de repositorios para acceso a datos
- Transformadores para formateo de respuestas API
- Sistema de eventos y listeners
- Workers para trabajos en segundo plano
- Multi-idioma con archivos de traducción
- Sistema de plantillas Twig

**Frontend (Versiones múltiples):**
- V1: AdminLTE + jQuery + Bootstrap
- V2: AdminLTE 4 + Alpine.js + Bootstrap 5 + Vite

#### 1.2 Modelos de Datos Principales

**Entidades Core:**
1. **Users** - Sistema de usuarios con grupos
2. **Accounts** - Cuentas financieras (activos, pasivos, gastos, ingresos)
3. **Transactions** - Transacciones financieras
4. **TransactionJournals** - Agrupación de transacciones
5. **Categories** - Categorización de gastos/ingresos
6. **Budgets** - Presupuestos con límites
7. **Bills** - Facturas recurrentes
8. **PiggyBanks** - Metas de ahorro
9. **Rules** - Reglas de automatización
10. **Tags** - Etiquetado de transacciones
11. **Currencies** - Monedas y tipos de cambio
12. **Attachments** - Archivos adjuntos
13. **Webhooks** - Integraciones externas

**Relaciones Principales:**
- User -> UserGroup (N:1)
- Account -> AccountType (N:1)
- Transaction -> Account (N:1)
- Transaction -> TransactionJournal (N:1)
- TransactionJournal -> User (N:1)
- Transaction -> Budget (N:N)
- Transaction -> Category (N:N)
- Transaction -> Tag (N:N)

#### 1.3 Funcionalidades Principales

**1. Gestión de Cuentas:**
- Tipos: Activos, Pasivos, Gastos, Ingresos
- Balances virtuales
- Reconciliación
- Metadatos personalizados
- Soporte IBAN

**2. Transacciones:**
- Retiros, Depósitos, Transferencias
- Soporte multi-moneda
- Transacciones divididas
- Geolocalización
- Archivos adjuntos
- Notas y descripciones

**3. Presupuestos:**
- Presupuestos por categoría
- Límites temporales
- Seguimiento de gastos
- Alertas y notificaciones

**4. Facturas:**
- Facturas recurrentes
- Fechas de vencimiento
- Recordatorios automáticos
- Vinculación con transacciones

**5. Metas de Ahorro (Piggy Banks):**
- Objetivos de ahorro
- Fechas objetivo
- Seguimiento de progreso

**6. Reportes y Gráficos:**
- Gráficos de gastos por categoría
- Reportes de flujo de caja
- Análisis de tendencias
- Exportación de datos

**7. Reglas de Automatización:**
- Triggers basados en condiciones
- Acciones automáticas
- Categorización automática
- Procesamiento en lotes

**8. Importación/Exportación:**
- CSV, OFX, MT940
- Mapeo de campos
- Reglas de importación
- Duplicación automática

#### 1.4 API REST

**Endpoints Principales:**
- `/api/v1/accounts` - Gestión de cuentas
- `/api/v1/transactions` - Transacciones
- `/api/v1/budgets` - Presupuestos
- `/api/v1/categories` - Categorías
- `/api/v1/bills` - Facturas
- `/api/v1/piggy-banks` - Metas de ahorro
- `/api/v1/rules` - Reglas
- `/api/v1/tags` - Etiquetas
- `/api/v1/charts` - Datos para gráficos
- `/api/v1/summary` - Resúmenes
- `/api/v1/search` - Búsqueda

### 2. ARQUITECTURA PROPUESTA PARA NEXT.JS 15

#### 2.1 Estructura del Proyecto Next.js

```
firefly-nextjs/
├── app/                          # App Router (Next.js 15)
│   ├── (auth)/                   # Grupo de rutas de autenticación
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (dashboard)/              # Grupo de rutas del dashboard
│   │   ├── dashboard/
│   │   ├── accounts/
│   │   ├── transactions/
│   │   ├── budgets/
│   │   ├── bills/
│   │   ├── piggy-banks/
│   │   ├── rules/
│   │   ├── reports/
│   │   ├── settings/
│   │   └── layout.tsx
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   ├── accounts/
│   │   ├── transactions/
│   │   ├── budgets/
│   │   └── [...endpoint]/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/                   # Componentes reutilizables
│   ├── ui/                      # Componentes base UI
│   ├── forms/                   # Componentes de formularios
│   ├── charts/                  # Componentes de gráficos
│   ├── tables/                  # Componentes de tablas
│   └── layout/                  # Componentes de layout
├── lib/                         # Utilidades y configuración
│   ├── auth.ts                  # Configuración de autenticación
│   ├── db.ts                    # Configuración de base de datos
│   ├── validations.ts           # Esquemas de validación
│   ├── api.ts                   # Cliente API
│   └── utils.ts                 # Utilidades generales
├── types/                       # Definiciones de tipos TypeScript
├── hooks/                       # Custom hooks
├── store/                       # Estado global (Zustand)
├── migrations/                  # Migraciones de base de datos
└── public/                      # Archivos estáticos
```

#### 2.2 Stack Tecnológico

**Frontend:**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn/ui (componentes)
- React Hook Form + Zod (formularios)
- TanStack Query (data fetching)
- Zustand (estado global)
- Recharts (gráficos)
- React Table (tablas)
- Framer Motion (animaciones)

**Backend:**
- Next.js API Routes
- Prisma ORM
- PostgreSQL/MySQL
- NextAuth.js (autenticación)
- Zod (validación)
- Nodemailer (emails)

**Utilidades:**
- date-fns (fechas)
- clsx (clases CSS)
- lucide-react (iconos)

### 3. DISEÑO DE LA BASE DE DATOS

#### 3.1 Esquema Principal (Prisma)

```prisma
// Users y autenticación
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String?
  password    String
  verified    Boolean  @default(false)
  userGroupId String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  userGroup   UserGroup @relation(fields: [userGroupId], references: [id])
  accounts    Account[]
  // ... otras relaciones
}

model UserGroup {
  id    String @id @default(cuid())
  title String
  users User[]
}

// Cuentas
model Account {
  id              String      @id @default(cuid())
  name            String
  accountTypeId   String
  virtualBalance  Decimal?
  iban            String?
  active          Boolean     @default(true)
  userId          String
  userGroupId     String
  
  accountType     AccountType @relation(fields: [accountTypeId], references: [id])
  user            User        @relation(fields: [userId], references: [id])
  // ... relaciones con transacciones
}

model AccountType {
  id       String    @id @default(cuid())
  type     String    // asset, expense, revenue, liability
  accounts Account[]
}

// Transacciones
model TransactionJournal {
  id          String   @id @default(cuid())
  userId      String
  description String
  date        DateTime
  
  transactions Transaction[]
}

model Transaction {
  id                    String   @id @default(cuid())
  accountId             String
  transactionJournalId  String
  amount                Decimal
  description           String?
  
  account              Account           @relation(fields: [accountId], references: [id])
  transactionJournal   TransactionJournal @relation(fields: [transactionJournalId], references: [id])
}

// Presupuestos
model Budget {
  id     String @id @default(cuid())
  name   String
  active Boolean @default(true)
  userId String
  
  budgetLimits BudgetLimit[]
}

model BudgetLimit {
  id       String   @id @default(cuid())
  budgetId String
  amount   Decimal
  startDate DateTime
  endDate   DateTime
  
  budget   Budget @relation(fields: [budgetId], references: [id])
}

// ... otros modelos
```

### 4. PROMPT COMPLETO PARA REPLICACIÓN

## PROMPT PARA DESARROLLAR FIREFLY III CON NEXT.JS 15

Desarrolla una aplicación completa de gestión financiera personal llamada "Firefly Next" usando las siguientes tecnologías:

### STACK TECNOLÓGICO REQUERIDO:
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Componentes**: Shadcn/ui
- **Base de datos**: PostgreSQL con Prisma ORM
- **Autenticación**: NextAuth.js v5
- **Formularios**: React Hook Form + Zod
- **Estado**: Zustand
- **Gráficos**: Recharts
- **Iconos**: Lucide React

### FUNCIONALIDADES PRINCIPALES A IMPLEMENTAR:

#### 1. AUTENTICACIÓN Y USUARIOS
- Sistema de registro/login con email y contraseña
- Verificación de email
- Recuperación de contraseña
- Grupos de usuarios para compartir datos familiares
- Perfiles de usuario con configuraciones personalizadas

#### 2. GESTIÓN DE CUENTAS
- **Tipos de cuenta**: Activos (corriente, ahorro), Gastos, Ingresos, Pasivos
- CRUD completo de cuentas con validaciones
- Balance virtual y balance real
- Soporte para IBAN
- Estado activo/inactivo
- Reconciliación de cuentas

#### 3. TRANSACCIONES
- **Tipos**: Retiros, Depósitos, Transferencias
- Formularios dinámicos según el tipo de transacción
- Soporte multi-moneda con tipos de cambio
- Transacciones divididas (split transactions)
- Archivos adjuntos
- Geolocalización opcional
- Búsqueda y filtrado avanzado

#### 4. CATEGORIZACIÓN Y ORGANIZACIÓN
- Sistema de categorías jerárquicas
- Etiquetas (tags) múltiples
- Reglas de automatización con triggers y acciones
- Aplicación masiva de reglas

#### 5. PRESUPUESTOS
- Presupuestos por categoría y período
- Límites de gasto con alertas
- Visualización de progreso con barras de progreso
- Alertas cuando se exceden límites

#### 6. FACTURAS Y PAGOS RECURRENTES
- Facturas recurrentes con frecuencias personalizables
- Fechas de vencimiento y recordatorios
- Vinculación automática con transacciones
- Estados: pendiente, pagada, vencida

#### 7. METAS DE AHORRO (PIGGY BANKS)
- Objetivos de ahorro con fechas límite
- Seguimiento visual del progreso
- Transferencias a/desde metas
- Notas y descripciones

#### 8. REPORTES Y ANÁLISIS
- **Dashboard principal** con resumen financiero
- Gráficos de gastos por categoría (pie chart)
- Evolución temporal de gastos/ingresos (line chart)
- Comparación de presupuestos vs gastos reales
- Análisis de flujo de caja
- Reportes personalizables por fecha

#### 9. IMPORTACIÓN Y EXPORTACIÓN
- Importación de CSV con mapeo de campos
- Exportación de datos en múltiples formatos
- Plantillas de importación
- Detección automática de duplicados

#### 10. CONFIGURACIÓN Y PERSONALIZACIÓN
- Configuración de moneda principal
- Idiomas múltiples (i18n)
- Temas claro/oscuro
- Configuración de fechas y formatos numéricos
- Preferencias de dashboard

### DISEÑO Y UX:

#### DISEÑO VISUAL:
- **Estilo**: Moderno, limpio, similar a aplicaciones bancarias
- **Colores**: Esquema profesional con azul como color primario
- **Layout**: Sidebar colapsible, header fijo, contenido responsive
- **Componentes**: Cards para secciones, modals para formularios
- **Tablas**: Sorteable, filtrable, paginación

#### NAVEGACIÓN:
```
Sidebar:
- Dashboard
- Cuentas
  - Todas las cuentas
  - Activos
  - Gastos
  - Ingresos
  - Pasivos
- Transacciones
  - Todas
  - Retiros
  - Depósitos  
  - Transferencias
- Presupuestos
- Facturas
- Metas de Ahorro
- Reportes
- Reglas
- Configuración
```

#### RESPONSIVE:
- Mobile-first approach
- Sidebar se convierte en drawer en móvil
- Tablas responsive con scroll horizontal
- Formularios adaptables

### ESTRUCTURA DE ARCHIVOS ESPECÍFICA:

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx
│   │   ├── accounts/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   └── create/page.tsx
│   │   ├── transactions/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   └── create/page.tsx
│   │   ├── budgets/
│   │   ├── bills/
│   │   ├── piggy-banks/
│   │   ├── reports/
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── accounts/route.ts
│   │   ├── transactions/route.ts
│   │   └── budgets/route.ts
│   └── globals.css
├── components/
│   ├── ui/ (shadcn components)
│   ├── forms/
│   │   ├── account-form.tsx
│   │   ├── transaction-form.tsx
│   │   └── budget-form.tsx
│   ├── charts/
│   │   ├── expense-pie-chart.tsx
│   │   ├── balance-line-chart.tsx
│   │   └── budget-progress-chart.tsx
│   ├── tables/
│   │   ├── transactions-table.tsx
│   │   ├── accounts-table.tsx
│   │   └── data-table.tsx
│   └── layout/
│       ├── sidebar.tsx
│       ├── header.tsx
│       └── main-layout.tsx
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   ├── validations.ts
│   ├── api.ts
│   └── utils.ts
├── types/
│   ├── auth.ts
│   ├── account.ts
│   ├── transaction.ts
│   └── index.ts
├── hooks/
│   ├── use-accounts.ts
│   ├── use-transactions.ts
│   └── use-budgets.ts
└── store/
    ├── auth-store.ts
    ├── accounts-store.ts
    └── ui-store.ts
```

### CARACTERÍSTICAS TÉCNICAS ESPECÍFICAS:

#### 1. FORMULARIOS DINÁMICOS:
- Formulario de transacciones que cambia según el tipo seleccionado
- Validación en tiempo real con Zod
- Autocompletado para cuentas y categorías
- Upload de archivos con preview

#### 2. TABLAS AVANZADAS:
- Sorting por columnas
- Filtros múltiples
- Búsqueda en tiempo real
- Paginación server-side
- Selección múltiple para acciones masivas

#### 3. GRÁFICOS INTERACTIVOS:
- Gráfico de dona para distribución de gastos
- Gráfico de líneas para evolución temporal
- Barras de progreso para presupuestos
- Tooltips informativos

#### 4. OPTIMIZACIONES:
- Server Components donde sea posible
- Streaming UI para carga inicial
- Optimistic updates en mutaciones
- Infinite scroll en listas largas
- Lazy loading de componentes pesados

#### 5. SEGURIDAD:
- Validación tanto client-side como server-side
- Rate limiting en APIs
- Sanitización de inputs
- CSRF protection
- Encriptación de datos sensibles

### COMANDOS DE DESARROLLO:

1. **Inicialización**:
```bash
npx create-next-app@latest firefly-next --typescript --tailwind --app
cd firefly-next
npx shadcn-ui@latest init
```

2. **Dependencias principales**:
```bash
npm install prisma @prisma/client
npm install next-auth@beta
npm install react-hook-form @hookform/resolvers zod
npm install zustand
npm install recharts
npm install lucide-react
npm install @tanstack/react-query
npm install date-fns
npm install clsx tailwind-merge
```

3. **Componentes Shadcn necesarios**:
```bash
npx shadcn-ui@latest add button input form card table dialog dropdown-menu
npx shadcn-ui@latest add sidebar sheet badge progress calendar
npx shadcn-ui@latest add select checkbox textarea tabs
```

### ORDEN DE IMPLEMENTACIÓN:

1. **Configuración inicial** (Prisma, NextAuth, Tailwind)
2. **Autenticación** (login, register, middleware)
3. **Layout principal** (sidebar, header, routing)
4. **Gestión de cuentas** (CRUD básico)
5. **Transacciones básicas** (crear, listar, editar)
6. **Dashboard inicial** (resumen básico)
7. **Categorías y etiquetas**
8. **Presupuestos básicos**
9. **Gráficos y reportes**
10. **Funcionalidades avanzadas** (reglas, importación, etc.)

### CRITERIOS DE ÉXITO:
- Aplicación completamente funcional
- Responsive en todos los dispositivos  
- Performance optimizada (Core Web Vitals)
- Código bien documentado y tipado
- Tests unitarios para funciones críticas
- Accesibilidad (a11y) básica implementada

Desarrolla esta aplicación paso a paso, creando primero la estructura base y luego implementando cada módulo de forma incremental. Asegúrate de que cada funcionalidad esté completamente implementada antes de pasar a la siguiente.