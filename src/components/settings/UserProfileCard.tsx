'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSettings } from '@/hooks/use-settings';
import { 
  Loader2, 
  User, 
  Wallet, 
  ArrowUpDown, 
  Target, 
  Receipt,
  Download,
  RotateCcw,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

export function UserProfileCard() {
  const { settingsData, loading, exportUserData, resetPreferences } = useSettings();
  const [exporting, setExporting] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleExportData = async () => {
    setExporting(true);
    try {
      await exportUserData();
      toast.success('Datos exportados exitosamente');
    } catch (error) {
      toast.error('Error al exportar datos');
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleResetPreferences = async () => {
    if (!confirm('¿Estás seguro de que quieres restablecer todas las preferencias? Esta acción no se puede deshacer.')) {
      return;
    }

    setResetting(true);
    try {
      await resetPreferences();
      toast.success('Preferencias restablecidas exitosamente');
    } catch (error) {
      toast.error('Error al restablecer preferencias');
      console.error('Reset error:', error);
    } finally {
      setResetting(false);
    }
  };

  if (loading && !settingsData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!settingsData) {
    return null;
  }

  const { user, statistics } = settingsData;

  return (
    <div className="space-y-6">
      {/* Información del usuario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Perfil de Usuario
          </CardTitle>
          <CardDescription>
            Información básica de tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nombre</label>
              <p className="text-lg">{user.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <div className="flex items-center gap-2">
                <p className="text-lg">{user.email}</p>
                {user.emailVerified ? (
                  <Badge variant="default" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Verificado
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs">
                    No verificado
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Grupo de Usuario</label>
            <p className="text-lg">{user.userGroupTitle}</p>
            <p className="text-sm text-muted-foreground">ID: {user.userGroupId}</p>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas del usuario */}
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas de tu Cuenta</CardTitle>
          <CardDescription>
            Resumen de tu actividad financiera
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Wallet className="h-8 w-8 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">{statistics.accountCount}</div>
              <p className="text-sm text-muted-foreground">Cuentas</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <ArrowUpDown className="h-8 w-8 text-green-500" />
              </div>
              <div className="text-2xl font-bold">{statistics.transactionCount}</div>
              <p className="text-sm text-muted-foreground">Transacciones</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-8 w-8 text-orange-500" />
              </div>
              <div className="text-2xl font-bold">{statistics.budgetCount}</div>
              <p className="text-sm text-muted-foreground">Presupuestos</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Receipt className="h-8 w-8 text-purple-500" />
              </div>
              <div className="text-2xl font-bold">{statistics.billCount}</div>
              <p className="text-sm text-muted-foreground">Facturas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones de cuenta */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Datos</CardTitle>
          <CardDescription>
            Exporta tus datos o restablece configuraciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Exportar datos */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Exportar Datos</h4>
              <p className="text-sm text-muted-foreground">
                Descargar una copia de todos tus datos financieros en formato JSON
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleExportData}
              disabled={exporting}
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Exportar
            </Button>
          </div>

          {/* Restablecer preferencias */}
          <div className="flex items-center justify-between p-4 border rounded-lg border-orange-200 bg-orange-50">
            <div>
              <h4 className="font-medium">Restablecer Preferencias</h4>
              <p className="text-sm text-muted-foreground">
                Volver a la configuración por defecto (no afecta tus datos financieros)
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleResetPreferences}
              disabled={resetting}
            >
              {resetting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-2" />
              )}
              Restablecer
            </Button>
          </div>

          {/* Información de seguridad */}
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-900">
                  Seguridad de datos
                </h4>
                <p className="mt-1 text-sm text-blue-700">
                  Todos tus datos están encriptados y seguros. La exportación incluye 
                  solo los datos necesarios y no incluye información sensible como contraseñas.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
