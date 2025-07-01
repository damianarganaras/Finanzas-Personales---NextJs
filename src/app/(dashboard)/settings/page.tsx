'use client';

import { useState } from 'react';
import { Save, User, Shield, Bell, Palette, Database, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    billReminders: true,
    budgetAlerts: true,
    goalMilestones: true,
    weeklyReports: false,
    securityAlerts: true
  });

  const [preferences, setPreferences] = useState({
    currency: 'EUR',
    language: 'es',
    theme: 'system',
    dateFormat: 'dd/mm/yyyy',
    numberFormat: 'european'
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">
          Personaliza tu experiencia y gestiona tu cuenta
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="preferences">Preferencias</TabsTrigger>
          <TabsTrigger value="data">Datos</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Información Personal</span>
              </CardTitle>
              <CardDescription>
                Actualiza tu información de perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input id="firstName" defaultValue="Administrador" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input id="lastName" placeholder="Apellido" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="admin@firefly.local" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" type="tel" placeholder="+34 600 000 000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Zona Horaria</Label>
                <Select defaultValue="europe/madrid">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="europe/madrid">Europa/Madrid</SelectItem>
                    <SelectItem value="europe/london">Europa/Londres</SelectItem>
                    <SelectItem value="america/new_york">América/Nueva York</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Seguridad</span>
              </CardTitle>
              <CardDescription>
                Gestiona la seguridad de tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Cambiar Contraseña</h3>
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Contraseña Actual</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva Contraseña</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                <Button>Actualizar Contraseña</Button>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Autenticación de Dos Factores</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">2FA</p>
                    <p className="text-sm text-muted-foreground">
                      Añade una capa extra de seguridad a tu cuenta
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Sesiones Activas</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="text-sm font-medium">Navegador Web - Windows</p>
                      <p className="text-xs text-muted-foreground">Última actividad: Hace 2 minutos</p>
                    </div>
                    <Button variant="outline" size="sm">Cerrar Sesión</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notificaciones</span>
              </CardTitle>
              <CardDescription>
                Configura qué notificaciones quieres recibir
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Recordatorios de Facturas</p>
                    <p className="text-sm text-muted-foreground">
                      Recibe notificaciones cuando una factura esté próxima a vencer
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.billReminders}
                    onCheckedChange={(checked: boolean) => 
                      setNotifications(prev => ({ ...prev, billReminders: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Alertas de Presupuesto</p>
                    <p className="text-sm text-muted-foreground">
                      Notificaciones cuando te acerques al límite de un presupuesto
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.budgetAlerts}
                    onCheckedChange={(checked: boolean) => 
                      setNotifications(prev => ({ ...prev, budgetAlerts: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Hitos de Metas</p>
                    <p className="text-sm text-muted-foreground">
                      Celebra cuando alcances hitos en tus metas de ahorro
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.goalMilestones}
                    onCheckedChange={(checked: boolean) => 
                      setNotifications(prev => ({ ...prev, goalMilestones: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Reportes Semanales</p>
                    <p className="text-sm text-muted-foreground">
                      Recibe un resumen semanal de tu actividad financiera
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked: boolean) => 
                      setNotifications(prev => ({ ...prev, weeklyReports: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Alertas de Seguridad</p>
                    <p className="text-sm text-muted-foreground">
                      Notificaciones sobre actividad de seguridad en tu cuenta
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.securityAlerts}
                    onCheckedChange={(checked: boolean) => 
                      setNotifications(prev => ({ ...prev, securityAlerts: checked }))
                    }
                  />
                </div>
              </div>
              
              <Button>Guardar Preferencias</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Preferencias</span>
              </CardTitle>
              <CardDescription>
                Personaliza la apariencia y el comportamiento de la aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Moneda Predeterminada</Label>
                  <Select 
                    value={preferences.currency} 
                    onValueChange={(value) => 
                      setPreferences(prev => ({ ...prev, currency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="USD">Dólar US ($)</SelectItem>
                      <SelectItem value="GBP">Libra (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <Select 
                    value={preferences.language}
                    onValueChange={(value) => 
                      setPreferences(prev => ({ ...prev, language: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Tema</Label>
                  <Select 
                    value={preferences.theme}
                    onValueChange={(value) => 
                      setPreferences(prev => ({ ...prev, theme: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Oscuro</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Formato de Fecha</Label>
                  <Select 
                    value={preferences.dateFormat}
                    onValueChange={(value) => 
                      setPreferences(prev => ({ ...prev, dateFormat: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button>Guardar Preferencias</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Gestión de Datos</span>
              </CardTitle>
              <CardDescription>
                Importa, exporta y gestiona tus datos financieros
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Exportar Datos</h3>
                <p className="text-sm text-muted-foreground">
                  Descarga una copia de todos tus datos financieros
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar CSV
                  </Button>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar JSON
                  </Button>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar PDF
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Importar Datos</h3>
                <p className="text-sm text-muted-foreground">
                  Importa transacciones desde archivos CSV o desde otros sistemas
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Importar CSV
                  </Button>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Desde Banco
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-red-600">Zona Peligrosa</h3>
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <h4 className="font-medium text-red-800">Eliminar Cuenta</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegúrate.
                  </p>
                  <Button variant="destructive" className="mt-3">
                    Eliminar Cuenta
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
