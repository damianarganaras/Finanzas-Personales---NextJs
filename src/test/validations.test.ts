import { describe, it, expect } from 'vitest'
import { accountSchema, transactionSchema } from '@/lib/validations'

describe('Validaciones - Tests Unitarios', () => {
  describe('accountSchema', () => {
    it('debe validar correctamente los datos válidos de cuenta', () => {
      // Arrange
      const validAccountData = {
        name: 'Mi Cuenta Bancaria',
        accountTypeId: 'ASSET',
        virtualBalance: 1000,
        iban: 'ES123456789',
        active: true,
        currencyId: 'curr-1'
      }

      // Act
      const result = accountSchema.safeParse(validAccountData)

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validAccountData)
      }
    })

    it('debe validar correctamente los datos mínimos requeridos', () => {
      // Arrange
      const minimalAccountData = {
        name: 'Cuenta Mínima',
        accountTypeId: 'ASSET',
        active: true
      }

      // Act
      const result = accountSchema.safeParse(minimalAccountData)

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Cuenta Mínima')
        expect(result.data.accountTypeId).toBe('ASSET')
        expect(result.data.active).toBe(true)
        expect(result.data.virtualBalance).toBeUndefined()
        expect(result.data.iban).toBeUndefined()
        expect(result.data.currencyId).toBeUndefined()
      }
    })

    it('debe fallar si el nombre está vacío', () => {
      // Arrange
      const invalidAccountData = {
        name: '',
        accountTypeId: 'ASSET',
        active: true
      }

      // Act
      const result = accountSchema.safeParse(invalidAccountData)

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('El nombre es requerido')
        expect(result.error.issues[0].path).toEqual(['name'])
      }
    })

    it('debe fallar si el tipo de cuenta está vacío', () => {
      // Arrange
      const invalidAccountData = {
        name: 'Mi Cuenta',
        accountTypeId: '',
        active: true
      }

      // Act
      const result = accountSchema.safeParse(invalidAccountData)

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('El tipo de cuenta es requerido')
        expect(result.error.issues[0].path).toEqual(['accountTypeId'])
      }
    })

    it('debe fallar si active no es un booleano', () => {
      // Arrange
      const invalidAccountData = {
        name: 'Mi Cuenta',
        accountTypeId: 'ASSET',
        active: 'true' // string en lugar de booleano
      }

      // Act
      const result = accountSchema.safeParse(invalidAccountData)

      // Assert
      expect(result.success).toBe(false)
    })

    it('debe aceptar virtualBalance como número', () => {
      // Arrange
      const accountDataWithBalance = {
        name: 'Mi Cuenta',
        accountTypeId: 'ASSET',
        active: true,
        virtualBalance: 1500.50
      }

      // Act
      const result = accountSchema.safeParse(accountDataWithBalance)

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.virtualBalance).toBe(1500.50)
      }
    })

    it('debe aceptar virtualBalance como undefined', () => {
      // Arrange
      const accountDataWithoutBalance = {
        name: 'Mi Cuenta',
        accountTypeId: 'ASSET',
        active: true,
        virtualBalance: undefined
      }

      // Act
      const result = accountSchema.safeParse(accountDataWithoutBalance)

      // Assert
      expect(result.success).toBe(true)
    })
  })

  describe('transactionSchema', () => {
    it('debe validar correctamente una transacción de retiro', () => {
      // Arrange
      const withdrawalData = {
        type: 'withdrawal' as const,
        description: 'Compra en el supermercado',
        amount: 250.50,
        date: new Date(),
        sourceAccountId: 'account-1',
        categoryIds: ['cat-1'],
        tagIds: ['tag-1'],
        notes: 'Compra semanal'
      }

      // Act
      const result = transactionSchema.safeParse(withdrawalData)

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.type).toBe('withdrawal')
        expect(result.data.sourceAccountId).toBe('account-1')
      }
    })

    it('debe validar correctamente una transacción de depósito', () => {
      // Arrange
      const depositData = {
        type: 'deposit' as const,
        description: 'Salario mensual',
        amount: 50000,
        date: new Date(),
        destinationAccountId: 'account-1',
        categoryIds: ['cat-2'],
        tagIds: [],
        notes: 'Pago de enero'
      }

      // Act
      const result = transactionSchema.safeParse(depositData)

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.type).toBe('deposit')
        expect(result.data.destinationAccountId).toBe('account-1')
      }
    })

    it('debe validar correctamente una transferencia', () => {
      // Arrange
      const transferData = {
        type: 'transfer' as const,
        description: 'Transferencia entre cuentas',
        amount: 1000,
        date: new Date(),
        sourceAccountId: 'account-1',
        destinationAccountId: 'account-2',
        categoryIds: [],
        tagIds: []
      }

      // Act
      const result = transactionSchema.safeParse(transferData)

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.type).toBe('transfer')
        expect(result.data.sourceAccountId).toBe('account-1')
        expect(result.data.destinationAccountId).toBe('account-2')
      }
    })

    it('debe fallar si withdrawal no tiene sourceAccountId', () => {
      // Arrange
      const invalidWithdrawal = {
        type: 'withdrawal' as const,
        description: 'Compra sin cuenta origen',
        amount: 100,
        date: new Date()
      }

      // Act
      const result = transactionSchema.safeParse(invalidWithdrawal)

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Debe seleccionar las cuentas apropiadas según el tipo de transacción')
      }
    })

    it('debe fallar si deposit no tiene destinationAccountId', () => {
      // Arrange
      const invalidDeposit = {
        type: 'deposit' as const,
        description: 'Depósito sin cuenta destino',
        amount: 100,
        date: new Date()
      }

      // Act
      const result = transactionSchema.safeParse(invalidDeposit)

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Debe seleccionar las cuentas apropiadas según el tipo de transacción')
      }
    })

    it('debe fallar si transfer no tiene ambas cuentas', () => {
      // Arrange
      const invalidTransfer = {
        type: 'transfer' as const,
        description: 'Transferencia incompleta',
        amount: 100,
        date: new Date(),
        sourceAccountId: 'account-1'
        // Falta destinationAccountId
      }

      // Act
      const result = transactionSchema.safeParse(invalidTransfer)

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Debe seleccionar las cuentas apropiadas según el tipo de transacción')
      }
    })

    it('debe fallar si el monto es negativo', () => {
      // Arrange
      const negativeAmountData = {
        type: 'withdrawal' as const,
        description: 'Monto negativo',
        amount: -100,
        date: new Date(),
        sourceAccountId: 'account-1'
      }

      // Act
      const result = transactionSchema.safeParse(negativeAmountData)

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('El monto debe ser positivo')
      }
    })

    it('debe fallar si el monto es cero', () => {
      // Arrange
      const zeroAmountData = {
        type: 'withdrawal' as const,
        description: 'Monto cero',
        amount: 0,
        date: new Date(),
        sourceAccountId: 'account-1'
      }

      // Act
      const result = transactionSchema.safeParse(zeroAmountData)

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('El monto debe ser positivo')
      }
    })

    it('debe fallar si la descripción está vacía', () => {
      // Arrange
      const emptyDescriptionData = {
        type: 'withdrawal' as const,
        description: '',
        amount: 100,
        date: new Date(),
        sourceAccountId: 'account-1'
      }

      // Act
      const result = transactionSchema.safeParse(emptyDescriptionData)

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('La descripción es requerida')
      }
    })

    it('debe usar arrays vacíos por defecto para categoryIds y tagIds', () => {
      // Arrange
      const minimalData = {
        type: 'withdrawal' as const,
        description: 'Compra básica',
        amount: 100,
        date: new Date(),
        sourceAccountId: 'account-1'
      }

      // Act
      const result = transactionSchema.safeParse(minimalData)

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.categoryIds).toEqual([])
        expect(result.data.tagIds).toEqual([])
      }
    })
  })
})
