# CodeViz Research Context

> **Note**: This file contains research context from CodeViz. Most recent contexts are at the bottom.

---

## Research Query

Quiero visualizar el mapa completo del sistema y sus tecnologías, y mapeado también todo lo referente al funcionamiento.

*Session: dfc3a4a89f0dcba69b0c867c9f06b87e | Generated: 7/3/2025, 7:18:09 PM*

### Analysis Summary

# Mapa del Sistema Finanzas Personales - Nextjs

Este informe detalla la arquitectura, tecnologías y funcionamiento del sistema Finanzas Personales - Nextjs, una aplicación de gestión financiera personal construida con Next.js.

## Arquitectura de Alto Nivel

El sistema Finanzas Personales - Nextjs sigue una arquitectura de aplicación web de pila completa (full-stack) utilizando el framework [Next.js](next.config.ts). Se compone principalmente de tres capas interconectadas:

1.  **Capa de Presentación (Frontend):** Desarrollada con [React](package.json) y [Next.js](next.config.ts), responsable de la interfaz de usuario y la interacción con el usuario.
2.  **Capa de Lógica de Negocio y API (Backend):** Implementada mediante [API Routes de Next.js](src/app/api/), que exponen endpoints para la comunicación con el frontend y encapsulan la lógica de negocio.
3.  **Capa de Persistencia de Datos:** Gestionada por [Prisma ORM](prisma/schema.prisma) para interactuar con una base de datos relacional (PostgreSQL, según la configuración de Prisma).

La comunicación entre el frontend y el backend se realiza a través de solicitudes HTTP a las API Routes. La autenticación y autorización se manejan en el lado del servidor y se integran con las rutas de la aplicación.

## Tecnologías Clave

*   **Framework Web:** [Next.js](next.config.ts) (React, TypeScript)
*   **Base de Datos:** PostgreSQL (inferido por [Prisma](prisma/schema.prisma))
*   **ORM:** [Prisma](prisma/schema.prisma)
*   **Lenguaje de Programación:** [TypeScript](tsconfig.json)
*   **Estilado:** [Tailwind CSS](postcss.config.mjs) (configurado en [tailwind.config.ts](tailwind.config.ts))
*   **Validación de Esquemas:** [Zod](package.json) (utilizado en [src/lib/validations.ts](src/lib/validations.ts))
*   **Autenticación:** Posiblemente [NextAuth.js](package.json) o una implementación personalizada (ver [src/lib/auth.ts](src/lib/auth.ts))
*   **Manejo de Estado (Frontend):** [Zustand](package.json) (utilizado en [src/store/](src/store/))
*   **Pruebas:** [Vitest](vitest.config.ts) y [React Testing Library](package.json) (ver [vitest.config.ts](vitest.config.ts) y [src/test/](src/test/))
*   **Linting:** [ESLint](eslint.config.mjs)
*   **Formularios:** [React Hook Form](package.json)

## Funcionamiento y Componentes Principales

### 1. Estructura de la Aplicación (Next.js App Router)

La aplicación sigue la convención del [App Router de Next.js](src/app/), organizando las rutas y la lógica de la siguiente manera:

*   **Rutas de Autenticación:** Contenidas en el grupo de rutas `(auth)`:
    *   [**Login Page**](src/app/(auth)/login/page.tsx): Interfaz para el inicio de sesión.
    *   [**Register Page**](src/app/(auth)/register/page.tsx): Interfaz para el registro de nuevos usuarios.
    *   [**Auth Layout**](src/app/(auth)/layout.tsx): Layout compartido para las páginas de autenticación.
*   **Rutas del Dashboard:** Contenidas en el grupo de rutas `(dashboard)`:
    *   [**Dashboard Page**](src/app/(dashboard)/dashboard/page.tsx): Página principal del usuario autenticado.
    *   [**Accounts Page**](src/app/(dashboard)/accounts/page.tsx): Gestión de cuentas financieras.
    *   [**Credit Cards Page**](src/app/(dashboard)/credit-cards/page.tsx): Gestión de tarjetas de crédito.
    *   [**Transactions Page**](src/app/(dashboard)/transactions/page.tsx): Visualización y gestión de transacciones.
    *   Otras páginas como [Bills](src/app/(dashboard)/bills/page.tsx), [Budgets](src/app/(dashboard)/budgets/page.tsx), [Piggy Banks](src/app/(dashboard)/piggy-banks/page.tsx), [Reports](src/app/(dashboard)/reports/page.tsx), [Settings](src/app/(dashboard)/settings/page.tsx).
    *   [**Dashboard Layout**](src/app/(dashboard)/layout.tsx): Layout compartido para las páginas del dashboard, incluyendo la barra lateral ([src/components/ui/sidebar.tsx](src/components/ui/sidebar.tsx)).
*   **API Routes:** Ubicadas en [src/app/api/](src/app/api/). Cada subdirectorio representa un recurso (e.g., `accounts`, `credit-cards`, `transactions`) y contiene un archivo [route.ts](src/app/api/accounts/route.ts) que maneja las solicitudes HTTP (GET, POST, PUT, DELETE).

### 2. Gestión de Datos y Persistencia

*   **Prisma ORM:** El archivo [prisma/schema.prisma](prisma/schema.prisma) define el esquema de la base de datos, incluyendo modelos como `User`, `Account`, `Transaction`, `CreditCard`, `Installment`, etc. Prisma genera un cliente ([src/lib/db.ts](src/lib/db.ts)) para interactuar con la base de datos de forma segura y tipada.
*   **Migraciones de Base de Datos:** Las migraciones se gestionan con Prisma y se encuentran en [prisma/migrations/](prisma/migrations/). Por ejemplo, [20250702214534_add_credit_cards_and_installments/migration.sql](prisma/migrations/20250702214534_add_credit_cards_and_installments/migration.sql) muestra la adición de tablas para tarjetas de crédito y cuotas.
*   **Seeders:** Archivos como [prisma/seed.ts](prisma/seed.ts), [prisma/seed-complete.ts](prisma/seed-complete.ts) y [prisma/seed-simple.ts](prisma/seed-simple.ts) se utilizan para poblar la base de datos con datos iniciales o de prueba.

### 3. Lógica de Negocio y Utilidades

*   **API Routes:** Contienen la lógica de negocio para cada recurso. Por ejemplo, [src/app/api/accounts/route.ts](src/app/api/accounts/route.ts) maneja la creación, lectura, actualización y eliminación de cuentas.
*   **Hooks Personalizados:** Ubicados en [src/hooks/](src/hooks/), estos hooks encapsulan la lógica de obtención y manipulación de datos para el frontend. Ejemplos incluyen [use-accounts.ts](src/hooks/use-accounts.ts) para interactuar con las cuentas y [use-credit-cards.ts](src/hooks/use-credit-cards.ts) para las tarjetas de crédito.
*   **Librerías de Utilidad:** El directorio [src/lib/](src/lib/) contiene funciones de utilidad:
    *   [**db.ts**](src/lib/db.ts): Inicialización del cliente Prisma para la conexión a la base de datos.
    *   [**auth.ts**](src/lib/auth.ts): Lógica relacionada con la autenticación (posiblemente configuración de NextAuth.js o funciones de sesión).
    *   [**utils.ts**](src/lib/utils.ts): Funciones de utilidad generales.
    *   [**validations.ts**](src/lib/validations.ts): Esquemas de validación de datos utilizando [Zod](package.json).

### 4. Componentes de Interfaz de Usuario

El directorio [src/components/](src/components/) organiza los componentes reutilizables de la UI:

*   **Componentes Compartidos (UI Library):** [src/components/ui/](src/components/ui/) contiene componentes básicos de UI como [button.tsx](src/components/ui/button.tsx), [input.tsx](src/components/ui/input.tsx), [dialog.tsx](src/components/ui/dialog.tsx), etc., que probablemente siguen el patrón de [Shadcn UI](https://ui.shadcn.com/).
*   **Componentes Específicos de Funcionalidad:**
    *   [**accounts/**](src/components/accounts/): Componentes relacionados con la gestión de cuentas, como [accounts-list.tsx](src/components/accounts/accounts-list.tsx) y [delete-account-button.tsx](src/components/accounts/delete-account-button.tsx).
    *   [**credit-cards/**](src/components/credit-cards/): Componentes para tarjetas de crédito, como [credit-cards-list.tsx](src/components/credit-cards/credit-cards-list.tsx) y [installments-summary.tsx](src/components/credit-cards/installments-summary.tsx).
    *   [**forms/**](src/components/forms/): Componentes para formularios.
    *   [**tables/**](src/components/tables/): Componentes para tablas, como [transactions-table.tsx](src/components/tables/transactions-table.tsx).
*   **Proveedores de Contexto:** [src/components/providers.tsx](src/components/providers.tsx) y [src/components/providers/toast-provider.tsx](src/components/providers/toast-provider.tsx) configuran proveedores de contexto globales para la aplicación (e.g., para notificaciones toast).

### 5. Tipos de Datos

El directorio [src/types/](src/types/) define las interfaces y tipos de TypeScript utilizados en toda la aplicación, asegurando la consistencia de los datos:

*   [**account.ts**](src/types/account.ts): Tipos relacionados con las cuentas.
*   [**credit-card.ts**](src/types/credit-card.ts): Tipos para tarjetas de crédito y cuotas.
*   [**transaction.ts**](src/types/transaction.ts): Tipos para transacciones.
*   [**auth.ts**](src/types/auth.ts): Tipos relacionados con la autenticación.

### 6. Pruebas

El directorio [src/test/](src/test/) contiene los tests unitarios y de integración para diversas partes del sistema, utilizando [Vitest](vitest.config.ts) como framework de pruebas:

*   [**accounts.test.ts**](src/test/accounts.test.ts): Pruebas para la lógica de cuentas.
*   [**credit-cards.test.ts**](src/test/credit-cards.test.ts): Pruebas para la lógica de tarjetas de crédito.
*   [**database.test.ts**](src/test/database.test.ts): Pruebas de integración con la base de datos.
*   [**hooks.test.ts**](src/test/hooks.test.ts): Pruebas para los hooks personalizados.
*   [**validations.test.ts**](src/test/validations.test.ts): Pruebas para los esquemas de validación.
*   [**setup.ts**](src/test/setup.ts): Archivo de configuración global para las pruebas.
*   [**test-data-factory.ts**](src/test/test-data-factory.ts): Utilidades para generar datos de prueba.

### 7. Scripts y Herramientas

El directorio [scripts/](scripts/) contiene scripts de utilidad para el desarrollo y la configuración:

*   [**setup-dev-db.ps1**](scripts/setup-dev-db.ps1) / [**setup-test-db.sh**](scripts/setup-test-db.sh): Scripts para configurar bases de datos de desarrollo y prueba.
*   [**fix-account-types.ts**](scripts/fix-account-types.ts) / [**migrate-account-types.ts**](scripts/migrate-account-types.ts): Scripts para la migración o corrección de tipos de cuenta.
*   [**init-currencies.ts**](scripts/init-currencies.ts): Script para inicializar datos de monedas.

Este mapa proporciona una visión general del sistema Finanzas Personales - Nextjs, sus componentes y cómo interactúan para ofrecer la funcionalidad de gestión financiera.

---

## Research Query

Investigate the "Zod" component in detail. Focus your analysis on these key files:
1. validations.ts (src/lib/validations.ts)

Provide insights about the component's main responsibilities and functionality and how it integrates with other system components

*Session: 531d1c2d2e12478599d0e13213d7e68e | Generated: 7/3/2025, 7:19:52 PM*

### Analysis Summary

# Zod Component Analysis

The **Zod** component in this codebase is primarily responsible for **data validation**. It provides a robust and type-safe way to define schemas for various data structures, ensuring that incoming data conforms to expected formats and constraints. This is crucial for maintaining data integrity and preventing errors throughout the application.

## Core Responsibilities and Functionality

The main responsibilities of Zod, as implemented in [src/lib/validations.ts](src/lib/validations.ts), include:

*   **Schema Definition**: Defining clear and concise validation schemas for different application entities.
*   **Data Type Validation**: Ensuring that data fields adhere to specific types (e.g., `string`, `number`, `boolean`, `date`, `array`).
*   **Constraint Enforcement**: Applying various constraints such as minimum length (`min`), email format (`email`), positive values (`positive`), and custom validation logic (`refine`).
*   **Error Messaging**: Providing custom error messages for validation failures, enhancing user experience and debugging.
*   **Type Inference**: Leveraging Zod's type inference capabilities to automatically generate TypeScript types from the defined schemas, promoting type safety across the application.

### Key Validation Schemas

The [src/lib/validations.ts](src/lib/validations.ts) file exports several Zod schemas, each tailored for specific data validation needs:

*   **`loginSchema`**: Validates user login credentials, specifically the `email` format and `password` minimum length.
*   **`registerSchema`**: Validates user registration data, including `name` minimum length, `email` format, `password` minimum length, and ensures `password` and `confirmPassword` match using a `refine` method.
*   **`accountSchema`**: Validates account creation/update data, including `name`, `accountTypeId`, `virtualBalance`, `iban`, `active` status, and `currencyId`.
*   **`transactionSchema`**: A complex schema for validating transaction data. It includes `type` (enum of `withdrawal`, `deposit`, `transfer`), `description`, `amount`, `date`, `sourceAccountId`, `destinationAccountId`, `categoryIds`, and `tagIds`. It uses a `refine` method to enforce conditional validation based on the transaction `type` (e.g., a `withdrawal` must have a `sourceAccountId`).
*   **`categorySchema`**: Validates category data, primarily the `name`.
*   **`budgetSchema`**: Validates budget data, including `name`, `active` status, `amount`, `startDate`, `endDate`, and `categoryIds`.

## Integration with Other System Components

The Zod schemas defined in [src/lib/validations.ts](src/lib/validations.ts) are integral to various parts of the application, primarily for **input validation** in forms and API endpoints.

### Frontend Integration (Forms)

The schemas are used to validate user input directly within the frontend forms. This is evident from the `FormData` type inferences (e.g., `LoginFormData`, `RegisterFormData`) exported from [src/lib/validations.ts](src/lib/validations.ts). These types are then used in components that handle form submissions.

For example:
*   The `loginSchema` is likely used in the login page component, such as [src/app/(auth)/login/page.tsx](src/app/(auth)/login/page.tsx), to validate user input before sending it to the backend.
*   Similarly, `registerSchema` would be used in [src/app/(auth)/register/page.tsx](src/app/(auth)/register/page.tsx).
*   `accountSchema` would be used in the account creation form, found at [src/app/(dashboard)/accounts/create/page.tsx](src/app/(dashboard)/accounts/create/page.tsx).
*   `transactionSchema` would be used in the transaction creation form, located at [src/app/(dashboard)/transactions/create/page.tsx](src/app/(dashboard)/transactions/create/page.tsx).

The integration typically involves using a form library (e.g., React Hook Form) that can integrate with Zod resolvers to provide client-side validation and display error messages to the user.

### Backend Integration (API Endpoints)

While not explicitly shown in the provided file, it is a common pattern for these same Zod schemas to be reused on the backend API routes to validate incoming request bodies. This provides a crucial layer of server-side validation, ensuring that only valid data is processed and stored in the database.

For instance:
*   API routes related to authentication (e.g., [src/app/api/auth/route.ts](src/app/api/auth/route.ts) - inferred path) would use `loginSchema` and `registerSchema`.
*   API routes for accounts (e.g., [src/app/api/accounts/route.ts](src/app/api/accounts/route.ts)) would use `accountSchema`.
*   API routes for transactions (e.g., [src/app/api/transactions/route.ts](src/app/api/transactions/route.ts)) would use `transactionSchema`.

This dual validation (frontend and backend) ensures robust data integrity and a secure application.

---

## Research Query

Crea una planificación para generar las funcionalidades faltantes del sistema, las cuales son mostrar toda la información relevante en el dashboard, validar la funcionalidad de cuentas, transacciones y tarjetas de crédito, crear funcionalidad de presupuestos, facturas, metas de ahorro, reportes y configuración.

*Session: 221b544b5b655ed38e90b6b1785ac418 | Generated: 7/3/2025, 7:41:01 PM*

### Analysis Summary

# Planificación de Funcionalidades Faltantes

Este informe detalla la planificación para implementar las funcionalidades faltantes en el sistema, siguiendo una estructura modular y replicando los patrones de desarrollo existentes.

## 1. Mejoras en el Dashboard

El objetivo es enriquecer el **dashboard** para mostrar un resumen consolidado de la información financiera clave.

### Componentes y Relaciones

*   **Página del Dashboard**: [src/app/(dashboard)/dashboard/page.tsx](src/app/(dashboard)/dashboard/page.tsx) será el punto central para la visualización de los datos.
*   **Hooks de Datos**: Se utilizarán los hooks existentes para obtener la información necesaria:
    *   Cuentas: [src/hooks/use-accounts.ts](src/hooks/use-accounts.ts)
    *   Transacciones: [src/hooks/use-transactions.ts](src/hooks/use-transactions.ts)
    *   Tarjetas de Crédito: [src/hooks/use-credit-cards.ts](src/hooks/use-credit-cards.ts)
*   **APIs Existentes**: Los hooks se conectan a las APIs correspondientes:
    *   Cuentas: [src/app/api/accounts/route.ts](src/app/api/accounts/route.ts)
    *   Transacciones: [src/app/api/transactions/route.ts](src/app/api/transactions/route.ts)
    *   Tarjetas de Crédito: [src/app/api/credit-cards/route.ts](src/app/api/credit-cards/route.ts)

### Acciones Propuestas

1.  **Modificar la Página del Dashboard**: Actualizar [src/app/(dashboard)/dashboard/page.tsx](src/app/(dashboard)/dashboard/page.tsx) para integrar los nuevos componentes de resumen.
2.  **Crear Componentes de Resumen**: Desarrollar nuevos componentes en un nuevo directorio `src/components/dashboard/` para mostrar la información de manera concisa:
    *   `src/components/dashboard/AccountSummaryCard.tsx`: Resumen de saldos de cuentas.
    *   `src/components/dashboard/RecentTransactionsList.tsx`: Lista de transacciones recientes.
    *   `src/components/dashboard/CreditCardSummary.tsx`: Resumen de saldos y pagos de tarjetas de crédito.
3.  **Optimización de APIs (Opcional)**: Si es necesario, crear una nueva API en `src/app/api/dashboard/route.ts` para agregar datos específicos del dashboard y reducir la carga del cliente.

## 2. Validación de Funcionalidades Existentes (Cuentas, Transacciones, Tarjetas de Crédito)

La validación se centrará en la expansión y mejora de la cobertura de pruebas para las funcionalidades principales.

### Componentes y Relaciones

*   **Archivos de Prueba Existentes**:
    *   Cuentas: [src/test/accounts.test.ts](src/test/accounts.test.ts)
    *   Transacciones: [src/test/transactions.test.ts](src/test/transactions.test.ts)
    *   Tarjetas de Crédito: [src/test/credit-cards.test.ts](src/test/credit-cards.test.ts)
    *   Lógica de Negocio de Tarjetas de Crédito: [src/test/credit-card-business-logic.test.ts](src/test/credit-card-business-logic.test.ts)
    *   APIs de Tarjetas de Crédito: [src/test/credit-cards-api.test.ts](src/test/credit-cards-api.test.ts)
    *   Pruebas de Integración de Base de Datos: [src/test/database-integration.test.ts](src/test/database-integration.test.ts)
*   **Configuración de Pruebas**: [vitest.config.ts](vitest.config.ts) y [src/test/setup.ts](src/test/setup.ts) definen el entorno de pruebas.

### Acciones Propuestas

1.  **Revisar y Ampliar Pruebas Unitarias**:
    *   Analizar [src/test/accounts.test.ts](src/test/accounts.test.ts), [src/test/transactions.test.ts](src/test/transactions.test.ts), y [src/test/credit-cards.test.ts](src/test/credit-cards.test.ts) para identificar áreas con baja cobertura.
    *   Añadir casos de prueba para escenarios de borde, manejo de errores y validaciones de negocio específicas.
2.  **Mejorar Pruebas de Integración**:
    *   Expandir las pruebas en [src/test/database-integration.test.ts](src/test/database-integration.test.ts) para cubrir flujos completos que involucren la interfaz de usuario, las APIs y la base de datos.
    *   Asegurar que las interacciones entre componentes (e.g., creación de una transacción que afecta el saldo de una cuenta) estén correctamente validadas.
3.  **Considerar Pruebas E2E (End-to-End)**: Evaluar la implementación de pruebas E2E (e.g., con Playwright o Cypress) para simular interacciones de usuario reales y validar la funcionalidad de extremo a extremo.

## 3. Creación de Nuevas Funcionalidades

Para cada nueva funcionalidad (Presupuestos, Facturas, Metas de Ahorro, Reportes, Configuración), se seguirá un patrón de desarrollo consistente, que incluye:

*   **Esquema de Base de Datos**: Modificación de [prisma/schema.prisma](prisma/schema.prisma) y ejecución de migraciones.
*   **APIs REST**: Creación de nuevas rutas en `src/app/api/`.
*   **Páginas de UI**: Desarrollo de nuevas páginas en `src/app/(dashboard)/`.
*   **Componentes de UI**: Creación de componentes reutilizables en `src/components/`.
*   **Hooks Personalizados**: Implementación de hooks en `src/hooks/` para la lógica de datos.
*   **Tipos de Datos**: Definición de nuevos tipos en `src/types/`.
*   **Pruebas**: Creación de archivos de prueba en `src/test/`.

### 3.1. Presupuestos (Budgets)

*   **Esquema**: Añadir modelo `Budget` a [prisma/schema.prisma](prisma/schema.prisma).
*   **API**: Crear `src/app/api/budgets/route.ts` para operaciones CRUD.
*   **Página UI**: Crear [src/app/(dashboard)/budgets/page.tsx](src/app/(dashboard)/budgets/page.tsx).
*   **Componentes UI**: Crear `src/components/budgets/BudgetForm.tsx` y `src/components/budgets/BudgetList.tsx`.
*   **Hook**: Crear `src/hooks/use-budgets.ts`.
*   **Tipo**: Crear `src/types/budget.ts`.
*   **Pruebas**: Crear `src/test/budgets.test.ts`.

### 3.2. Facturas (Bills)

*   **Esquema**: Añadir modelo `Bill` a [prisma/schema.prisma](prisma/schema.prisma).
*   **API**: Crear `src/app/api/bills/route.ts` para operaciones CRUD.
*   **Página UI**: Crear [src/app/(dashboard)/bills/page.tsx](src/app/(dashboard)/bills/page.tsx).
*   **Componentes UI**: Crear `src/components/bills/BillForm.tsx` y `src/components/bills/BillList.tsx`.
*   **Hook**: Crear `src/hooks/use-bills.ts`.
*   **Tipo**: Crear `src/types/bill.ts`.
*   **Pruebas**: Crear `src/test/bills.test.ts`.

### 3.3. Metas de Ahorro (Piggy Banks / Savings Goals)

*   **Esquema**: Añadir modelo `PiggyBank` o `SavingsGoal` a [prisma/schema.prisma](prisma/schema.prisma).
*   **API**: Crear `src/app/api/piggy-banks/route.ts` para operaciones CRUD.
*   **Página UI**: La página [src/app/(dashboard)/piggy-banks/page.tsx](src/app/(dashboard)/piggy-banks/page.tsx) ya existe y será actualizada.
*   **Componentes UI**: Crear `src/components/piggy-banks/PiggyBankForm.tsx` y `src/components/piggy-banks/PiggyBankList.tsx`.
*   **Hook**: Crear `src/hooks/use-piggy-banks.ts`.
*   **Tipo**: Crear `src/types/piggy-bank.ts`.
*   **Pruebas**: Crear `src/test/piggy-banks.test.ts`.

### 3.4. Reportes (Reports)

*   **Esquema**: No se requieren nuevos modelos de esquema, ya que los reportes agregan datos existentes.
*   **API**: Crear `src/app/api/reports/route.ts` para generar datos de reportes (e.g., gastos por categoría, ingresos vs. egresos). Esto podría implicar consultas complejas a la base de datos.
*   **Página UI**: La página [src/app/(dashboard)/reports/page.tsx](src/app/(dashboard)/reports/page.tsx) ya existe y será actualizada.
*   **Componentes UI**: Crear componentes de visualización de datos en `src/components/reports/` (e.g., `src/components/reports/SpendingByCategoryChart.tsx`, `src/components/reports/IncomeExpenseChart.tsx`), posiblemente utilizando el directorio [src/components/charts/](src/components/charts/).
*   **Hook**: Crear `src/hooks/use-reports.ts`.
*   **Tipo**: Crear `src/types/report.ts` para las estructuras de datos de los reportes.
*   **Pruebas**: Crear `src/test/reports.test.ts` para validar la lógica de generación de datos de reportes.

### 3.5. Configuración (Settings)

*   **Esquema**: Posiblemente añadir un modelo `UserSetting` a [prisma/schema.prisma](prisma/schema.prisma) para preferencias de usuario.
*   **API**: Crear `src/app/api/settings/route.ts` para gestionar la configuración del usuario.
*   **Página UI**: La página [src/app/(dashboard)/settings/page.tsx](src/app/(dashboard)/settings/page.tsx) ya existe y será actualizada.
*   **Componentes UI**: Crear componentes de formulario y visualización en `src/components/settings/` (e.g., `src/components/settings/ProfileSettingsForm.tsx`, `src/components/settings/NotificationSettings.tsx`).
*   **Hook**: Crear `src/hooks/use-settings.ts`.
*   **Tipo**: Crear `src/types/setting.ts`.
*   **Pruebas**: Crear `src/test/settings.test.ts`.

## 4. Pasos Generales para la Implementación

1.  **Migraciones de Prisma**: Después de cada modificación a [prisma/schema.prisma](prisma/schema.prisma), ejecutar `npx prisma migrate dev --name <nombre_de_migracion>`.
2.  **Implementación de APIs**: Desarrollar la lógica de negocio y las operaciones de base de datos para las nuevas rutas de API.
3.  **Implementación de Hooks**: Crear los hooks personalizados para la interacción con las nuevas APIs.
4.  **Implementación de UI**: Diseñar e implementar las páginas y componentes de la interfaz de usuario.
5.  **Pruebas Exhaustivas**: Escribir pruebas unitarias, de integración y, si es posible, E2E para cada nueva funcionalidad.
6.  **Actualización de Navegación**: Modificar el componente de la barra lateral [src/components/ui/sidebar.tsx](src/components/ui/sidebar.tsx) o el layout principal [src/app/(dashboard)/layout.tsx](src/app/(dashboard)/layout.tsx) para incluir enlaces a las nuevas páginas.

