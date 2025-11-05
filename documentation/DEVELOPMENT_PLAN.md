# Plan de Desarrollo Actualizado - Firefly Next
*Actualizado: 3 de Enero, 2025*

## 📊 Estado Actual del Proyecto

### ✅ Funcionalidades Completadas
- **Autenticación**: Sistema NextAuth.js completo con login/registro
- **Base de datos**: Esquema Prisma con 20+ modelos (Users, Accounts, Transactions, etc.)
- **APIs básicas**: Rutas para account-types, currencies, accounts, transactions, credit-cards
- **Componentes UI**: Sistema de componentes con Shadcn/ui y Tailwind
- **Hooks personalizados**: use-accounts, use-transactions, use-credit-cards, etc.
- **Estructura modular**: Patrón consistente de API → Hook → Component

### ⚠️ Problemas Críticos Identificados

#### 1. Test Suite (26/117 tests fallando)
**Problemas principales:**
- **Database Integration Tests**: Errores de foreign key constraints (accountTypeId, userGroupId)
- **NextAuth Module Resolution**: Tests de API fallan por problemas de importación de 'next/server'
- **Test Data Factory**: Inconsistencias en la creación de datos de prueba
- **Parallel Test Execution**: Problemas de cleanup entre tests

**Tests que funcionan:**
- ✅ Unit tests (currencies, account-types, validations, business-logic)
- ✅ React component tests (credit-cards, account-details)
- ✅ Hook tests (currencies, account-types)

**Tests fallando:**
- ❌ Database integration tests (6/6 failing)
- ❌ Database constraints tests (7/10 failing)
- ❌ Database schema tests (6/12 failing)
- ❌ API tests with NextAuth (accounts.test.ts, credit-cards-api.test.ts)
- ❌ account-types-fixed.test.ts (mock configuration issues)

#### 2. Funcionalidades Incompletas
- **Dashboard**: Página básica sin datos reales
- **Presupuestos**: Modelo existe pero no hay UI completa
- **Facturas**: Modelo existe pero no hay implementación
- **Reportes**: Página existe pero sin funcionalidad
- **Configuración**: Página básica sin funcionalidad real

## 🎯 Plan de Desarrollo Priorizado

### Fase 1: Estabilización (Crítica) - 2-3 días
> Objetivo: Conseguir test suite estable y funcional

#### 1.1 Reparar Database Integration Tests
```bash
# Problemas a resolver:
- Foreign key constraint violations en accountTypeId y userGroupId
- TestDataFactory con referencias inconsistentes
- Database cleanup entre tests paralelos
```

**Acciones:**
1. **Revisar TestDataFactory** (`src/test/test-data-factory.ts`)
   - Verificar que createAccount use accountTypeId válidos
   - Verificar que createUser use userGroupId válidos
   - Añadir validación de prerequisitos

2. **Mejorar setup de integración** (`src/test/integration-setup.ts`)
   - Implementar orden correcto de cleanup (transactions → accounts → users → userGroups)
   - Añadir locks para evitar conflictos de tests paralelos
   - Verificar que las foreign keys existan antes de crear dependencias

3. **Reparar tests específicos:**
   - `database-integration.test.ts`
   - `database-constraints.test.ts`
   - `database.test.ts`

#### 1.2 Resolver NextAuth Module Issues
```bash
# Error: Cannot find module 'next/server' imported from next-auth/lib/env.js
```

**Acciones:**
1. **Actualizar mocks de NextAuth** en `src/test/setup.ts`
2. **Verificar compatibilidad** NextAuth v5 con Next.js 15
3. **Implementar workarounds** para tests de API que requieren auth

#### 1.3 Reparar Mock Configuration
```bash
# Error: db.accountType.findMany.mockResolvedValueOnce is not a function
```

**Acciones:**
1. **Revisar archivo** `src/test/account-types-fixed.test.ts`
2. **Corregir configuración** de mocks de Prisma
3. **Unificar approach** entre unit tests y integration tests

### Fase 2: Expansión de Tests (1-2 días)
> Objetivo: Expandir cobertura y añadir tests missing

#### 2.1 Completar Test Coverage
1. **E2E Tests básicos** (opcional, con Playwright)
2. **Error boundary tests** para componentes React
3. **API edge cases** (validation, authentication, authorization)
4. **Business logic tests** para nuevas funcionalidades

### Fase 3: Dashboard Funcional (2-3 días)
> Objetivo: Dashboard con datos reales y widgets interactivos

#### 3.1 Crear Dashboard Components
```
src/components/dashboard/
├── AccountSummaryCard.tsx      # Resumen de saldos
├── RecentTransactionsList.tsx  # Últimas transacciones
├── BudgetProgress.tsx          # Progreso de presupuestos
├── CreditCardSummary.tsx       # Estado tarjetas de crédito
├── QuickActions.tsx            # Acciones rápidas
└── FinancialChart.tsx          # Gráfico principal
```

#### 3.2 Dashboard API Optimization
```
src/app/api/dashboard/route.ts
- Endpoint agregado para obtener datos del dashboard
- Queries optimizadas para evitar N+1
- Cache layer para mejorar performance
```

#### 3.3 Dashboard Page Update
```
src/app/(dashboard)/dashboard/page.tsx
- Integración de nuevos componentes
- Loading states y error handling
- Responsive design
```

### Fase 4: Funcionalidades Core Missing (4-5 días)
> Objetivo: Completar funcionalidades básicas existentes

#### 4.1 Presupuestos (Budgets) - 1-2 días
```
Ya existe modelo Budget en schema.prisma
Crear:
- src/app/api/budgets/route.ts ✅
- src/hooks/use-budgets.ts ✅
- Actualizar src/app/(dashboard)/budgets/page.tsx
- src/components/budgets/BudgetForm.tsx
- src/components/budgets/BudgetList.tsx
- src/components/budgets/BudgetProgressCard.tsx
- src/test/budgets.test.ts
```

#### 4.2 Facturas (Bills) - 1-2 días
```
Ya existe modelo Bill en schema.prisma
Crear:
- src/app/api/bills/route.ts
- src/hooks/use-bills.ts  
- src/app/(dashboard)/bills/page.tsx
- src/components/bills/BillForm.tsx
- src/components/bills/BillList.tsx
- src/components/bills/BillCalendar.tsx
- src/test/bills.test.ts
```

#### 4.3 Reportes (Reports) - 1-2 días
```
Utiliza datos existentes
Crear:
- src/app/api/reports/route.ts
- src/hooks/use-reports.ts
- Actualizar src/app/(dashboard)/reports/page.tsx
- src/components/reports/SpendingChart.tsx
- src/components/reports/IncomeChart.tsx
- src/components/reports/CategoryBreakdown.tsx
- src/test/reports.test.ts
```

### Fase 5: Funcionalidades Avanzadas (3-4 días)
> Objetivo: Completar funcionalidades avanzadas y pulir

#### 5.1 Configuración (Settings)
- Preferencias de usuario
- Configuración de monedas
- Configuración de notificaciones
- Importación/Exportación de datos

#### 5.2 Navegación y UX
- Actualizar sidebar con nuevas funcionalidades
- Breadcrumbs y navegación mejorada
- Search functionality
- Filtros avanzados

## 🛠️ Comandos de Desarrollo

### Testing
```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests específicos
npm test -- src/test/database-integration.test.ts

# Ejecutar tests en modo watch
npm test -- --watch

# Ver coverage
npm test -- --coverage
```

### Base de datos
```bash
# Reset completo de la DB
npx prisma migrate reset --force

# Ejecutar migraciones
npx prisma migrate deploy

# Regenerar cliente
npx prisma generate

# Seed con datos completos
npm run db:seed-complete
```

### Desarrollo
```bash
# Desarrollo con hot reload
npm run dev

# Build de producción
npm run build

# Linting
npm run lint
```

## 📈 Métricas de Progreso

### Tests Status
- **Total**: 117 tests
- **Passing**: 91 (77.8%)
- **Failing**: 26 (22.2%)
- **Target**: 95%+ passing

### Funcionalidades Status
- **Core Features**: 70% completado
- **Dashboard**: 30% completado  
- **Advanced Features**: 20% completado
- **Target**: 90%+ completado

## 🚨 Notas Importantes

1. **Priorizar estabilidad** sobre nuevas funcionalidades
2. **Tests deben pasar** antes de añadir features nuevas
3. **Mantener patrón modular** establecido
4. **Documentar breaking changes** en cada fase
5. **Backup de DB** antes de cambios importantes

## 🎯 Ruta de Desarrollo Inmediata

### PASO 1: Estabilización de Tests (30 minutos)
```bash
PRIORIDAD MÁXIMA - Sin tests estables no podemos desarrollar con confianza
```
1. **Fix TestDataFactory foreign key issues**
2. **Resolver NextAuth module resolution**
3. **Validar que los tests básicos pasen**

### PASO 2: Dashboard Funcional (45 minutos)
```bash
IMPACTO ALTO - Es la primera página que ven los usuarios
```
1. **Crear componentes de resumen financiero**
2. **Integrar datos reales en el dashboard**
3. **Añadir widgets interactivos**

### PASO 3: Completar Funcionalidades Core (90 minutos) ✅
```bash
COMPLETAR LO INICIADO - Aprovechar el trabajo ya hecho
```
1. **✅ Bills/Facturas - API + UI completa**
2. **✅ Reportes básicos - Gráficos y análisis**
3. **✅ Settings - Configuración de usuario**

### PASO 4: Integración y Pulido (30 minutos)
```bash
EXPERIENCIA DE USUARIO - Hacer que todo funcione cohesivamente
```
1. **Navegación entre módulos**
2. **Validaciones y error handling**
3. **Responsive design**

## 📋 Next Steps Inmediatos

1. **[AHORA]** Arreglar TestDataFactory y ejecutar tests
2. **[SIGUIENTE]** Crear Dashboard con datos reales
3. **[DESPUÉS]** Implementar Bills/Facturas
4. **[LUEGO]** Reportes básicos
5. **[FINAL]** Settings y pulido

---

*🚀 EMPEZAMOS AHORA - Ruta optimizada para máximo valor en mínimo tiempo*
