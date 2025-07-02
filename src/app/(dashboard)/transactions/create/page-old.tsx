'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalendarIcon, ArrowLeftIcon, SaveIcon } from 'lucide-react'
import Link from 'next/link'

export default function CreateTransactionPage() {
  const router = useRouter()
  const [transactionType, setTransactionType] = useState('withdrawal')
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    sourceAccount: '',
    destinationAccount: '',
    category: '',
    notes: '',
    currency: 'EUR'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica para guardar la transacción
    console.log('Creating transaction:', { type: transactionType, ...formData })
    
    // Simular guardado exitoso
    router.push('/dashboard/transactions')
  }

  const mockAccounts = [
    { id: '1', name: 'Cuenta Corriente Principal', type: 'asset' },
    { id: '2', name: 'Cuenta de Ahorros', type: 'asset' },
    { id: '3', name: 'Tarjeta de Crédito', type: 'liability' },
    { id: '4', name: 'Gastos Alimentación', type: 'expense' },
    { id: '5', name: 'Gastos Transporte', type: 'expense' },
    { id: '6', name: 'Salario', type: 'revenue' },
    { id: '7', name: 'Ingresos Adicionales', type: 'revenue' }
  ]

  const mockCategories = [
    'Alimentación',
    'Transporte',
    'Vivienda',
    'Entretenimiento',
    'Salud',
    'Educación',
    'Compras',
    'Servicios',
    'Transferencias',
    'Otros'
  ]

  const getAccountsByType = (type: string) => {
    return mockAccounts.filter(account => account.type === type)
  }

  const getSourceAccounts = () => {
    switch (transactionType) {
      case 'withdrawal':
        return getAccountsByType('asset')
      case 'deposit':
        return getAccountsByType('revenue')
      case 'transfer':
        return getAccountsByType('asset')
      default:
        return mockAccounts
    }
  }

  const getDestinationAccounts = () => {
    switch (transactionType) {
      case 'withdrawal':
        return getAccountsByType('expense')
      case 'deposit':
        return getAccountsByType('asset')
      case 'transfer':
        return getAccountsByType('asset').filter(account => account.id !== formData.sourceAccount)
      default:
        return mockAccounts
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/transactions">
          <Button variant="outline" size="sm">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nueva Transacción</h1>
          <p className="text-muted-foreground">
            Crea una nueva transacción financiera
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Detalles de la Transacción</CardTitle>
          <CardDescription>
            Completa la información de tu nueva transacción
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={transactionType} onValueChange={setTransactionType}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="withdrawal">Gasto</TabsTrigger>
                <TabsTrigger value="deposit">Ingreso</TabsTrigger>
                <TabsTrigger value="transfer">Transferencia</TabsTrigger>
              </TabsList>

              <TabsContent value="withdrawal" className="space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sourceAccount">Cuenta de origen</Label>
                    <Select 
                      value={formData.sourceAccount} 
                      onValueChange={(value) => setFormData({...formData, sourceAccount: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cuenta" />
                      </SelectTrigger>
                      <SelectContent>
                        {getSourceAccounts().map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destinationAccount">Categoría de gasto</Label>
                    <Select 
                      value={formData.destinationAccount} 
                      onValueChange={(value) => setFormData({...formData, destinationAccount: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {getDestinationAccounts().map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="deposit" className="space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sourceAccount">Fuente de ingreso</Label>
                    <Select 
                      value={formData.sourceAccount} 
                      onValueChange={(value) => setFormData({...formData, sourceAccount: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar fuente" />
                      </SelectTrigger>
                      <SelectContent>
                        {getSourceAccounts().map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destinationAccount">Cuenta de destino</Label>
                    <Select 
                      value={formData.destinationAccount} 
                      onValueChange={(value) => setFormData({...formData, destinationAccount: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cuenta" />
                      </SelectTrigger>
                      <SelectContent>
                        {getDestinationAccounts().map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="transfer" className="space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sourceAccount">Cuenta de origen</Label>
                    <Select 
                      value={formData.sourceAccount} 
                      onValueChange={(value) => setFormData({...formData, sourceAccount: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cuenta origen" />
                      </SelectTrigger>
                      <SelectContent>
                        {getSourceAccounts().map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destinationAccount">Cuenta de destino</Label>
                    <Select 
                      value={formData.destinationAccount} 
                      onValueChange={(value) => setFormData({...formData, destinationAccount: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cuenta destino" />
                      </SelectTrigger>
                      <SelectContent>
                        {getDestinationAccounts().map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe la transacción..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Cantidad</Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      placeholder="0.00"
                      className="pr-12"
                      required
                    />
                    <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                      {formData.currency}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Notas adicionales..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                <SaveIcon className="mr-2 h-4 w-4" />
                Guardar Transacción
              </Button>
              <Link href="/dashboard/transactions">
                <Button variant="outline">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
