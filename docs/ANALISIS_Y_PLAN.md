# FIREFLY NEXT - ANÁLISIS INTEGRAL DEL PROYECTO

## 📊 ESTADO ACTUAL DEL BACKEND

### APIs implementadas (status)
- Accounts: GET, POST — ✅ completo
- Transactions: GET (filters), POST (withdrawal/deposit/transfer) — ✅ completo
- Categories: GET, POST — ✅ completo (con validación de duplicados por usuario)
- Tags: GET, POST — ✅ completo (con validación de duplicados por usuario)
- Budgets: 
  - /api/budgets: GET paginado + POST crear con limits y categories — ✅
  - /api/budgets/[id]: GET/PUT/DELETE — ✅
  - /api/budgets/progress: GET — ✅ (calcula gasto por período y breakdown por categoría)
- Bills: GET, POST — ✅ (incluye autoPayEnabled y frecuencia)
- Credit Cards:
  - /api/credit-cards: GET, POST — ✅
  - /api/credit-cards/purchases: GET, POST — ✅ (genera cuotas, categorías, tags)
  - /api/credit-cards/installments: GET — ✅
  - /api/credit-cards/installments/[id]/pay: POST — ✅ (crea journal/transaction y marca pagada)
- Saving Goals:
  - /api/saving-goals: GET (enriquece currentAmount a partir de aportes + conversión), POST, PUT, DELETE — ✅
  - /api/saving-goals/[id]/contributions: GET, POST — ✅
- Reports: GET — ✅ (gastos por categoría, income vs expenses 12m, balances, resumen, top transacciones, budgets, upcoming bills)
- Settings: GET, PUT, POST(action) — 🔄 parcial (simula persistencia de preferencias; falta tabla UserSettings)
- Currencies: GET — ✅
- Dashboard: GET — ✅ (métricas, cuentas, transacciones recientes, presupuestos, tarjetas, metas, facturas)

### Lógica de negocio y validaciones
- Zod: account, transaction, budget, bill, credit card purchase, settings (parcial) — ✅
- Autenticación: NextAuth v5 con credentials; JWT con userGroupId — ✅
- Autorización: Filtros por userId en consultas — ✅ (consistente)
- Errores: Respuestas 400/401/404/500 consistentes — ✅
- Notas: SavingGoals usa (db as any) temporal; Settings no persiste en DB.

## 🗄️ ANÁLISIS DE BASE DE DATOS

### Modelos Prisma clave (extracto)
- Users, UserGroup — ✅
- AccountType, Account, Currency — ✅
- TransactionJournal, Transaction — ✅
- Category, Tag + tablas N:M — ✅
- Budget, BudgetLimit, BudgetCategory — ✅
- Bill — ✅
- PiggyBank — ✅ (modelo legacy; coexistiendo con SavingGoal)
- SavingGoal, SavingContribution — ✅ (nuevos)
- CreditCard, CreditCardPurchase, InstallmentPayment — ✅
- Attachments, Rules (Trigger/Action) — presentes, sin API aún

### Integridad y consideraciones
- Claves compuestas N:M correctas — ✅
- Índices implícitos por @id/@unique — ✅; considerar índices en foreign keys de tablas voluminosas (transaction_xxx) — 🎯 recomendado
- Convivencia PiggyBank vs SavingGoal — ⚠️ mantener uno solo a mediano plazo; migración de datos si aplica
- UserSettings — ❌ faltante (tabla dedicada para preferencias)

## 🎨 ESTADO ACTUAL DEL FRONTEND

### Páginas implementadas (dashboard group)
- Dashboard, Accounts (list/show/create/edit), Transactions (list/show/edit/create), Budgets, Bills, Credit Cards (list/create), Credit Card Purchase New, Piggy Banks, Reports, Settings, Debug — ✅

### Componentes reutilizables de dashboard
- DashboardMetrics, DollarWidget, AccountSummaryCard, RecentTransactionsList, CreditCardSummary, FinancialChart, QuickActions — ✅

### Hooks y estado de datos
- use-accounts, use-transactions, use-budgets, use-bills, use-credit-cards, use-saving-goals, use-reports, use-settings, use-dashboard, use-categories, use-tags, use-currencies — ✅
- Patrones: React Query, invalidación y refresh; optimista en categorías/tags y goals — ✅

### Formularios y validaciones
- React Hook Form + Zod en cuentas, transacciones, compras con tarjeta, presupuestos, bills — ✅
- A11y en diálogos de presupuestos — ✅ (Radix titles/descriptions)

### UX/Accesibilidad/Consistencia
- Auto-refresh de listas clave; inline-create de categorías/tags con selección persistente — ✅
- i18n básico en labels en español; faltan utilidades globales de idioma/moneda por usuario — 🔄 parcial

## 📋 MATRIZ DE FUNCIONALIDADES
| Funcionalidad | Backend | Frontend | Estado | Prioridad |
|---------------|---------|----------|--------|-----------|
| Autenticación básica | ✅ | ✅ | ✅ Completo | Alta |
| Cuentas (CRUD) | ✅ | ✅ | ✅ Completo | Alta |
| Transacciones básicas | ✅ | ✅ | ✅ Completo | Alta |
| Categorías/Tags | ✅ | ✅ | ✅ Completo | Media |
| Presupuestos + progreso | ✅ | ✅ | ✅ Completo | Alta |
| Facturas | ✅ | ✅ | ✅ Completo | Media |
| Tarjetas de crédito + cuotas | ✅ | ✅ | ✅ Completo | Alta |
| Metas de ahorro (SavingGoal) | ✅ | ✅ | ✅ Completo | Media |
| Dashboard enriquecido | ✅ | ✅ | ✅ Completo | Alta |
| Reportes | ✅ | ✅ | ✅ Completo | Alta |
| Configuración (persistencia) | 🔄 Parcial | ✅ | 🔄 Incompleto (sin DB) | Media |
| Adjuntos | ❌ | ❌ | ❌ Faltante | Baja |
| Reglas (automatización) | ❌ | ❌ | ❌ Faltante | Media |
| Importación/Exportación avanzada | ❌ | ❌ | ❌ Faltante | Baja |
| i18n/formatos por usuario | 🔄 Parcial | 🔄 Parcial | 🔄 Incompleto | Media |

## 🚀 PLAN DE DESARROLLO INCREMENTAL

### Fase 1: Backend Foundation (1-2 sprints)
- Crear tabla UserSettings y API completa (/api/settings): GET/PUT persistentes.
- Reconciliar PiggyBank vs SavingGoal: deprecate PiggyBank en UI; script de migración si hay datos.
- Endpoints Attachments (subida mínima con restricciones) — opcional en esta fase.
- Endpoints Rules (esqueleto): CRUD reglas/trigger/action sin motor — opcional.
- Aceptación: build OK, pruebas de APIs, settings persisten, dashboard lee preferencias.

### Fase 2: Database Optimization (1 sprint)
- Índices en claves foráneas: transaction.accountId, transactionJournal.userId/date, N:M tables.
- Revisar cascade y onDelete en N:M si aplica.
- Aceptación: explain básico sin full scans para queries críticas; migraciones aplicadas.

### Fase 3: Frontend Core (1-2 sprints)
- Settings UI completo: moneda, idioma, formatos, dashboard defaults; conexión PUT persistente.
- Reportes: filtros por fecha/categoría/cuenta en UI con URL state.
- Dashboard: widgets configurables por usuario (mostrar/ocultar según settings).
- Aceptación: UX fluida, a11y valid, sin regresiones en refresh.

### Fase 4: Integration & QA (1 sprint)
- Tests unitarios: currency conversion, budget progress, CC installment calc.
- Tests integración: crear transacción afecta saldos y reportes; pagar cuota afecta estado.
- Opcional E2E con Playwright: smoke flows (login, crear cuenta, transacción, presupuesto).
- Aceptación: >80% cobertura en módulos críticos; pipeline de test estable.

### Fase 5: Advanced Features (2+ sprints)
- Attachments: subir/descargar, vincular a transaction/bill/journal.
- Rules: motor mínimo (ej: set_category cuando description contiene X).
- Importación CSV: plantilla + mapeo simple para transacciones.
- Aceptación: flujos documentados, validaciones robustas, límites de tamaño.

## 📈 ROADMAP VISUAL (resumen)
- S1-S2: F1 Backend Foundation
- S3: F2 DB Optimization
- S4-S5: F3 Frontend Core
- S6: F4 Integration & QA
- S7+: F5 Advanced Features

## 🎯 RECOMENDACIONES ESTRATÉGICAS
- Unificar SavingGoal como módulo oficial y ocultar PiggyBank en UI; migración opcional.
- Introducir UserSettings para i18n/moneda/tema y consumirlo en hooks formatters.
- Consolidar validaciones Zod compartidas y DTOs en /types para API/cliente.
- Evitar (db as any): regenerar Prisma Client tras migraciones y actualizar imports.
- Añadir rate limiting en rutas críticas (auth, transactions, reports) y sanitización adicional.

## QUALITY GATES
- Build: PASS (Next.js 15)
- Typecheck: PASS
- Unit tests: TODO (plan en Fase 4)
- Smoke test manual: Dashboard, Accounts, Transactions, Budgets, Bills, CC, Saving Goals — OK

## Cobertura de requisitos
- Dashboard enriquecido: Done
- Validar cuentas/transacciones/CC: Done (APIs y flujos verificados)
- Presupuestos, facturas, metas, reportes, configuración: Done/Parcial (settings persistencia pendiente)

---
Documento vivo. Actualizar por sprint con métricas de avance y decisiones técnicas.
